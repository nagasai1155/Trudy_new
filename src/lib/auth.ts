import { getSession } from '@auth0/nextjs-auth0'

export async function getServerSession() {
  const session = await getSession()
  return session
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

