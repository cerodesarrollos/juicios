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
    <aside className="no-print fixed left-0 top-0 z-40 flex h-screen w-56 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <span className="text-xl">⚖️</span>
        <span className="font-bold text-accent">Juicios</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {nav.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-muted hover:bg-white/5 hover:text-text'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-border p-4 text-xs text-text-muted">
        Caso Toro v1.0
      </div>
    </aside>
  )
}
