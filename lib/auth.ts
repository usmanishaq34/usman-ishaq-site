import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "./db"
import { verifyCode } from "./two-factor"
import { getClientIp, isBlocked, rateLimited, recordFailure, recordSuccess } from "./login-guard"

// Sign-in needs the password and the six-digit code emailed by
// /api/auth/2fa. Both are checked here, so a session is never created from
// the password alone. The IP block from lib/login-guard.ts is enforced here
// too, so calling the credentials endpoint directly gains nothing.
function sessionHours(): number {
  const n = Number(process.env.ADMIN_SESSION_HOURS)
  return Number.isFinite(n) && n >= 1 && n <= 24 * 30 ? n : 8
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  code: z.string().regex(/^\d{6}$/),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // A dashboard sign-in lasts 8 hours, one working day, then the sign-in and
  // its emailed code are asked for again. ADMIN_SESSION_HOURS overrides it.
  session: { strategy: "jwt", maxAge: sessionHours() * 60 * 60, updateAge: 60 * 60 },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "Sign-in code", type: "text" },
      },
      async authorize(raw, request) {
        const ip = getClientIp(request.headers)
        if (rateLimited("signin", ip)) return null
        if (await isBlocked(ip)) return null

        const parsed = credentialsSchema.safeParse(raw)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })
        const valid = user?.hashedPassword ? await bcrypt.compare(parsed.data.password, user.hashedPassword) : false
        if (!user?.hashedPassword || !valid) {
          await recordFailure(ip, parsed.data.email, request.headers.get("user-agent"))
          return null
        }

        const codeOk = await verifyCode(user.id, parsed.data.code)
        if (!codeOk) return null
        await recordSuccess(ip)

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        ;(session.user as any).id = token.id
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
})

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12)
}
