/**
 * Pone (o cambia) la contraseña de un usuario y se asegura de que sea ADMIN.
 * La contraseña se escribe de forma OCULTA; no se muestra ni queda en el historial.
 *
 * Uso:  npx tsx scripts/set-password.ts <email>
 *   ej: npx tsx scripts/set-password.ts informa@blablaele.com
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import readline from "node:readline";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

config({ path: resolve(__dirname, "../.env.local") });
const db = new PrismaClient();

function ask(question: string, hidden = false): Promise<string> {
  return new Promise((res) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      // Silencia el eco de los caracteres tecleados (muestra solo la pregunta).
      // @ts-expect-error API interna de readline
      rl._writeToOutput = (s: string) => {
        if (s.startsWith(question) || s.includes("\n")) rl.output.write(s);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      res(answer);
    });
  });
}

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Falta el email.  Uso: npx tsx scripts/set-password.ts <email>");
    process.exit(1);
  }

  const p1 = await ask(`Contraseña para ${email}: `, true);
  if (p1.length < 8) {
    console.error("❌ La contraseña debe tener al menos 8 caracteres.");
    process.exit(1);
  }
  const p2 = await ask("Repite la contraseña: ", true);
  if (p1 !== p2) {
    console.error("❌ Las contraseñas no coinciden. Nada cambiado.");
    process.exit(1);
  }

  const password = await bcrypt.hash(p1, 10);
  await db.user.upsert({
    where: { email },
    create: { email, name: email.split("@")[0], password, role: "ADMIN" },
    update: { password, role: "ADMIN" },
  });
  console.log(`✅ Contraseña establecida y rol ADMIN para ${email}. Ya puede entrar en /login.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
