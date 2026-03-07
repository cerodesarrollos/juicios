'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/transactions', label: 'Transacciones', icon: '💰' },
  { href: '/evidence', label: 'Evidencia', icon: '📎' },
  { href: '/parties', label: 'Partes', icon: '👥' },
  { href: '/timeline', label: 'Línea de Tiempo', icon: '📅' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="no-print fixed left-0 top-0 z-40 flex h-screen w-56 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-14 items-center gap-2 border-b border-gray-200 px-4">
        <span className="text-xl">⚖️</span>
        <span className="text-lg font-bold text-green-800">Juicios</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {nav.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'border-l-3 border-green-800 bg-green-50 text-green-800'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-gray-200 p-4 text-xs text-gray-400">
        Caso Toro v1.0
      </div>
    </aside>
  )
}
