import { redirect } from 'next/navigation'

export default function LoginPage() {
  // Redirect to Auth0 login
  redirect('/api/auth/login')
}

