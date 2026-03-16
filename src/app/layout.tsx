import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ThemeProvider } from '@/components/layout/theme-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Kane Nguyen — Software Engineer',
    template: '%s | Kane Nguyen',
  },
  description:
    "Software Engineer's portfolio showcasing projects, skills, and experience.",
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
        </ThemeProvider>
      </body>
    </html>
  )
}
