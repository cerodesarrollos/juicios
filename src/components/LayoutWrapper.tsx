'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isShared = pathname.startsWith('/shared')

  if (isShared) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto max-w-5xl p-4 md:p-8">
          {children}
        </div>
      </main>
    )
  }

  return (
    <>
      <Sidebar />
      <main className="ml-0 min-h-screen md:ml-56">
        <div className="mx-auto max-w-7xl p-4 md:p-6">
          {children}
        </div>
      </main>
    </>
  )
}
