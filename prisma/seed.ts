import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = "admin@laskentukianas.com";
  const pass = "kentukianas";
  const password = await bcrypt.hash(pass, 10);
  await db.user.upsert({
    where: { email },
    create: { email, name: "Jorge", password, role: "ADMIN" },
    update: { password, role: "ADMIN" },
  });
  console.log("Admin listo -> " + email + " / " + pass);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
