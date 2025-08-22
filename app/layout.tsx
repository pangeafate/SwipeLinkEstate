import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/lib/query/QueryProvider'
import { PageErrorBoundary } from '@/lib/errors/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SwipeLink Estate - Real Estate Platform',
  description: 'Discover properties through an intuitive swipe interface',
  keywords: 'real estate, properties, swipe, tinder, housing, buy, sell',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div id="root">
          <PageErrorBoundary>
            <QueryProvider>
              {children}
            </QueryProvider>
          </PageErrorBoundary>
        </div>
      </body>
    </html>
  )
}