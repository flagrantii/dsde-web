import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/src/store/provider'
import { ErrorBoundary } from '@/src/components/error-boundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'nodi - AI Research Assistant',
  description: 'Discover and connect research papers through intelligent conversations',
  keywords: 'research, AI, papers, academic, graph, visualization',
  authors: [{ name: 'nodi' }]
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <ErrorBoundary>
            <div className="relative flex min-h-screen flex-col">
              <div className="flex-1">{children}</div>
            </div>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  )
}
