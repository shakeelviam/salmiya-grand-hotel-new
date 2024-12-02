import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import axios from 'axios'

// Define custom session type
declare module 'next-auth' {
  interface Session {
    accessToken?: string
    user: {
      id: string
      email: string
      name: string
    }
  }
  interface User {
    id: string
    email: string
    name: string
    token: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    user?: {
      id: string
      email: string
      name: string
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'ERPNext',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        try {
          // Login to ERPNext
          const response = await axios.post(
            `${process.env.ERPNEXT_URL}/api/method/login`,
            {
              usr: credentials.email,
              pwd: credentials.password
            },
            {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            }
          )

          if (response.data.message === 'Logged In') {
            // Get user details
            const userResponse = await axios.get(
              `${process.env.ERPNEXT_URL}/api/method/frappe.auth.get_logged_user`,
              {
                headers: {
                  'Cookie': response.headers['set-cookie']?.join('; ') || '',
                  'Accept': 'application/json'
                }
              }
            )

            if (!userResponse.data.message) {
              throw new Error('Failed to get user details')
            }

            return {
              id: userResponse.data.message,
              email: credentials.email,
              name: userResponse.data.message,
              token: response.headers['set-cookie']?.join('; ') || ''
            }
          }

          throw new Error('Invalid credentials')
        } catch (error) {
          console.error('Auth error:', error)
          if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Authentication failed')
          }
          throw error
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.token
        token.user = {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken
        session.user = token.user || session.user
      }
      return session
    }
  },
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
