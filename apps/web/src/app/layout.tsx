import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ThemeProvider } from '@/components/layout/theme-provider'
import { SecretPortal } from '@/components/shared/secret-portal'
import { Toaster } from 'sonner'
import { SITE_URL } from '@/lib/constants'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Kane Nguyen — Software Engineer',
    template: '%s | Kane Nguyen',
  },
  description:
    "Software Engineer portfolio — projects, blog, and diary by Kane Nguyen.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Kane Nguyen',
    images: [
      {
        url: '/images/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Kane Nguyen — Software Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/og-default.png'],
  },
  alternates: {
    types: { 'application/rss+xml': '/feed.xml' },
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} flex min-h-screen flex-col`}>
        <ThemeProvider>
          {/* Gradient accent bar */}
          <div className="h-1 gradient-accent" aria-hidden="true" />

          <Header />

          <main className="flex-1">{children}</main>

          <Footer />
          <SecretPortal />
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
