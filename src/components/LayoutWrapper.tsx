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
      <main className="ml-0 min-h-screen bg-gray-100 md:ml-56">
        <div className="mx-auto max-w-7xl p-4 md:p-6">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
            {children}
          </div>
        </div>
      </main>
    </>
  )
}
