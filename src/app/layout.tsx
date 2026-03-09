import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import LayoutWrapper from '@/components/LayoutWrapper'

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'Juicios — Legal Case Management',
  description: 'Dashboard de gestion de causas legales',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  )
}
