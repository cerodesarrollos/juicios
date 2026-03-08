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
    <div className="min-h-screen bg-gray-200 p-3 md:p-6">
      <div className="mx-auto max-w-[1400px] overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200" style={{ minHeight: 'calc(100vh - 48px)' }}>
        <div className="flex" style={{ minHeight: 'calc(100vh - 48px)' }}>
          <Sidebar />
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
