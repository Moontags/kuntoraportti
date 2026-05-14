import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Kuntoraportti - MP-Logistiikka',
  description: 'Moottoripyoran kuntotarkastusraportti',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Kuntoraportti' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fi">
      <body>
        <div className="container-app">
          {children}
        </div>
      </body>
    </html>
  )
}
