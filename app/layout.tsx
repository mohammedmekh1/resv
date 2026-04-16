import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RESV Dashboard – نظام إدارة فنادق مكة المكرمة',
  description: 'لوحة تحكم متكاملة لنظام RESV لحجوزات فنادق مكة المكرمة',
  themeColor: '#0f0d0b',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  )
}
