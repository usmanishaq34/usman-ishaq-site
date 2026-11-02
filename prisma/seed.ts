/**
 * Creates the first dashboard user. Run once after `npm run db:push`, with
 * ADMIN_EMAIL and ADMIN_PASSWORD set in .env.local:
 *   npm run db:seed
 * Running it again with the same email changes nothing.
 */
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD before seeding.")
  if (password.length < 8) throw new Error("ADMIN_PASSWORD needs at least 8 characters.")

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: process.env.ADMIN_NAME || "Usman Ishaq", hashedPassword: await bcrypt.hash(password, 12), role: "ADMIN" },
  })
  console.log(`Admin user ready: ${user.email}`)
}

main()
  .catch((e) => {
    console.error("Seed failed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
