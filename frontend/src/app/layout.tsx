import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'Scan More - Complete Security Suite',
  description: 'Scan, analyze, and stay compliant — instantly. AI-powered website compliance scanner for accessibility, security, and regulatory requirements.',
  keywords: 'compliance, scanner, AI, accessibility, security, website, audit',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const apiHost = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const isProduction = process.env.NODE_ENV === 'production'
  
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href={apiHost} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={apiHost} />
        <link rel="preconnect" href="https://openrouter.ai" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://openrouter.ai" />
        {isProduction && (
          <meta name="robots" content="index, follow" />
        )}
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
          signInFallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/dashboard"
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}
