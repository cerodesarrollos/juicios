'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import Sidebar from './Sidebar'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isShared = pathname.startsWith('/shared')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
    <div className="h-screen overflow-hidden bg-gray-200 md:p-4 lg:p-5">
      <div className="mx-auto h-full max-h-full max-w-[1600px] overflow-hidden bg-white shadow-xl md:rounded-2xl md:ring-1 md:ring-gray-200 md:h-[calc(100vh-40px)]">
        <div className="flex h-full relative">

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="fixed top-3 left-3 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md ring-1 ring-gray-200 md:hidden"
          >
            {mobileMenuOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4l12 12M16 4L4 16" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 5h14M3 10h14M3 15h14" />
              </svg>
            )}
          </button>

          {/* Sidebar - desktop always visible, mobile as overlay */}
          <div className={`
            fixed inset-y-0 left-0 z-40 w-56 transform transition-transform duration-200 ease-in-out
            md:relative md:translate-x-0 md:transition-none
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
          </div>

          {/* Mobile overlay backdrop */}
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/30 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          {/* Main content — scroll is here */}
          <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto p-4 pt-14 md:p-6 md:pt-6 h-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
