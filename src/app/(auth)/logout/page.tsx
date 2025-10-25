import { redirect } from 'next/navigation'

export default function LogoutPage() {
  // Redirect to landing page (Auth0 bypassed temporarily)
  redirect('/')
}

