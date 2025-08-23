import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'ComplianceScanner AI - AI-Powered Website Compliance Scanner',
  description: 'Scan, analyze, and stay compliant — instantly. AI-powered website compliance scanner for accessibility, security, and regulatory requirements.',
  keywords: 'compliance, scanner, AI, accessibility, security, website, audit',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const apiHost = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href={apiHost} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={apiHost} />
        <link rel="preconnect" href="https://openrouter.ai" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://openrouter.ai" />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}
