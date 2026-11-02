/**
 * Creates the dashboard user, or sets its password. Run after `npm run db:push`,
 * with ADMIN_EMAIL and ADMIN_PASSWORD set in .env.local:
 *   npm run db:seed
 * Running it again for an existing email resets that user's password to
 * ADMIN_PASSWORD, which is also the way back in after a forgotten password.
 */
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD before seeding.")
  if (password.length < 8) throw new Error("ADMIN_PASSWORD needs at least 8 characters.")

  const hashedPassword = await bcrypt.hash(password, 12)
  const user = await prisma.user.upsert({
    where: { email },
    update: { hashedPassword },
    create: { email, name: process.env.ADMIN_NAME || "Usman Ishaq", hashedPassword, role: "ADMIN" },
  })
  console.log(`Admin user ready: ${user.email} (password set from ADMIN_PASSWORD)`)
}

main()
  .catch((e) => {
    console.error("Seed failed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
