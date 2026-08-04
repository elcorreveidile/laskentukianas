import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Google solo se activa si hay credenciales configuradas.
const googleId = process.env.GOOGLE_CLIENT_ID;
const googleSecret = process.env.GOOGLE_CLIENT_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [
    ...(googleId && googleSecret
      ? [Google({ clientId: googleId, clientSecret: googleSecret })]
      : []),

    // Enlace mágico: valida un token de un solo uso (SHA-256) guardado en
    // VerificationToken. No usa contraseña.
    Credentials({
      id: "magic-link",
      name: "magic-link",
      credentials: {
        token: { label: "Token", type: "text" },
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        const rawToken = typeof credentials?.token === "string" ? credentials.token : "";
        const email =
          typeof credentials?.email === "string"
            ? credentials.email.toLowerCase().trim()
            : "";
        if (!rawToken || !email) return null;

        const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");
        const vt = await db.verificationToken.findUnique({ where: { token: hashed } });
        if (!vt || vt.identifier !== email || vt.expires < new Date()) return null;

        // Un solo uso: se borran todos los tokens de ese email.
        await db.verificationToken.deleteMany({ where: { identifier: email } });

        const user = await db.user.findUnique({ where: { email } });
        if (!user) return null;
        if (!user.emailVerified) {
          await db.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } });
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
        };
      },
    }),

    // Contraseña (el de siempre).
    Credentials({
      name: "credentials",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const user = await db.user.findUnique({ where: { email } });
        if (!user?.password) return null;
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Google: crea o enlaza el usuario por email (rol USER por defecto).
      if (account?.provider === "google" && user.email) {
        const existing = await db.user.findUnique({ where: { email: user.email } });
        if (!existing) {
          const created = await db.user.create({
            data: { email: user.email, name: user.name, image: user.image, role: "USER" },
          });
          user.id = created.id;
          (user as { role?: string }).role = "USER";
        } else {
          user.id = existing.id;
          (user as { role?: string }).role = existing.role;
          if (!existing.image && user.image) {
            await db.user.update({ where: { id: existing.id }, data: { image: user.image } });
          }
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "USER";
      }
      return session;
    },
  },
});
