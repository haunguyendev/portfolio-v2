import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const ALLOWED_EMAILS = ['haunt150603@gmail.com']

// Base URL for Better Auth (public-facing URL for OAuth callbacks)
const baseURL = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'

// Trusted origins for CSRF protection
// In production behind Cloudflare Tunnel, we need to trust the public HTTPS URL
const trustedOrigins = [
  baseURL,
  // Add production URL explicitly if different from BETTER_AUTH_URL
  process.env.NODE_ENV === 'production' ? 'https://portfolio.haunguyendev.xyz' : null,
].filter(Boolean) as string[]

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!ALLOWED_EMAILS.includes(user.email)) {
            return false
          }
          return undefined
        },
      },
    },
    session: {
      create: {
        before: async (session) => {
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { email: true },
          })
          if (!user || !ALLOWED_EMAILS.includes(user.email)) {
            return false
          }
          return undefined
        },
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL,
  trustedOrigins,
  advanced: {
    // Enable secure cookies when baseURL is HTTPS
    // Required for cookies to work behind Cloudflare Tunnel (SSL termination)
    useSecureCookies: baseURL.startsWith('https://'),
    // Trust X-Forwarded-* headers from Cloudflare
    // Allows Better Auth to detect real protocol (HTTPS) and client IP
    trustedProxyHeaders: true,
  },
})
