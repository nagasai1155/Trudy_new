import NextAuth, { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error('GOOGLE_CLIENT_ID is not set')
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('GOOGLE_CLIENT_SECRET is not set')
}

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // Initial sign in
      if (account && user) {
        token.accessToken = account.access_token
        token.idToken = account.id_token
        token.provider = account.provider
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (session.user && token) {
        session.user.id = token.sub || ''
        ;(session as any).accessToken = token.accessToken
        ;(session as any).idToken = token.idToken
      }
      return session
    },
  },
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  session: {
    strategy: 'jwt',
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

// Server-side session helper
export async function getServerSession() {
  const session = await auth()
  return session
}

export async function requireAuth() {
  const session = await auth()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}
