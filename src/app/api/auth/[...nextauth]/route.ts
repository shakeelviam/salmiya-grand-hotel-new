import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/db'

// Define custom session type
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
    }
  }
  interface User {
    id: string
    email: string
    name: string
    role: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            roles: true,
          },
        })

        if (!user) {
          throw new Error('No user found with the provided email')
        }

        const isPasswordValid = await compare(credentials.password, user.password || '')
        if (!isPasswordValid) {
          throw new Error('Invalid password')
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.roles[0]?.name || 'STAFF',
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
