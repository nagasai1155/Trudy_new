import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/app/providers'
import './globals.css'

// Inter font with weights: 300, 400, 500, 600, 700
const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Truedy AI Platform - AI Voice Agent Management',
  description: 'Build, manage, and deploy AI voice agents at scale',
  icons: {
    icon: [
      { url: '/icons/image1.jpg', sizes: '32x32', type: 'image/jpeg' },
      { url: '/icons/image1.jpg', sizes: '16x16', type: 'image/jpeg' },
    ],
    apple: [
      { url: '/icons/image1.jpg', sizes: '180x180', type: 'image/jpeg' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

