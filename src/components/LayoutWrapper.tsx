'use client'

import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isShared = pathname.startsWith('/shared')
  const isChat = pathname.includes('/chat')

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
        {isChat ? (
          // Chat page: full bleed, no card wrapper (has its own WhatsApp-style bg)
          <div className="p-4 md:p-6">
            <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl shadow-sm ring-1 ring-gray-200">
              {children}
            </div>
          </div>
        ) : (
          // All other pages: wrapped in a white card
          <div className="mx-auto max-w-7xl p-4 md:p-6">
            <div className="overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
              {children}
            </div>
          </div>
        )}
      </main>
    </>
  )
}
