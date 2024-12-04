import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Research Chat',
  description: 'Chat interface for research discovery',
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 