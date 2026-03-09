'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import Sidebar from './Sidebar'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isShared = pathname.startsWith('/shared')
  const isLogin = pathname.startsWith('/login')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (isLogin) {
    return <>{children}</>
  }

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
      <div className="mx-auto flex h-full max-h-full max-w-[1600px] flex-col overflow-hidden bg-white shadow-xl md:rounded-2xl md:ring-1 md:ring-gray-200 md:h-[calc(100vh-40px)]">

        {/* Global header — spans full width */}
        <header className="flex h-12 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 md:rounded-t-2xl">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100 md:hidden"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 5h14M3 10h14M3 15h14" />
              </svg>
            </button>
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg">⚖</span>
              <span className="text-base font-bold text-green-800">Juicios</span>
            </Link>
          </div>
        </header>

        {/* Body: sidebar + main */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Sidebar - desktop always visible, mobile as overlay */}
          <div className={`
            fixed inset-y-0 left-0 z-40 w-56 transform transition-transform duration-200 ease-in-out
            md:relative md:translate-x-0 md:transition-none md:flex-shrink-0
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

          {/* Main content */}
          <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto h-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
