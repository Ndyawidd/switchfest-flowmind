// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar' // pastikan path sesuai dengan lokasi Navbar.tsx

export const metadata: Metadata = {
  title: 'FlowMind',
  description: 'Productivity app with ToDo, Notes, Mood Tracker, Summarizer',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* Navbar muncul di semua halaman */}
        <Navbar />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  )
}
