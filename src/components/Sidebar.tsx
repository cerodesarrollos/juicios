'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Sidebar() {
  const pathname = usePathname()
  const [caseName, setCaseName] = useState<string | null>(null)

  const caseMatch = pathname.match(/^\/case\/([^/]+)/)
  const caseSlug = caseMatch ? caseMatch[1] : null

  useEffect(() => {
    if (!caseSlug) {
      setCaseName(null)
      return
    }
    fetch(`/api/cases?slug=${caseSlug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.title) setCaseName(data.title)
        else setCaseName(caseSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
      })
      .catch(() => setCaseName(caseSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())))
  }, [caseSlug])

  const caseSubNav = [
    { label: 'Resumen', tab: 'resumen' },
    { label: 'Transacciones', tab: 'transacciones' },
    { label: 'Evidencia', tab: 'evidencia' },
    { label: 'Partes', tab: 'partes' },
    { label: 'Timeline', tab: 'timeline' },
    { label: 'Configuracion', tab: 'config' },
  ]

  return (
    <aside className="no-print fixed left-0 top-0 z-40 flex h-screen w-56 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-14 items-center gap-2 border-b border-gray-200 px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">&#9878;</span>
          <span className="text-lg font-bold text-green-800">Juicios</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <Link
          href="/"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname === '/'
              ? 'border-l-3 border-green-800 bg-green-50 text-green-800'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <span>&#127968;</span>
          <span>Inicio</span>
        </Link>

        {caseSlug && (
          <div className="mt-4">
            <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Caso Actual
            </p>
            <p className="px-3 py-1 text-sm font-semibold text-green-800 truncate">
              {caseName ?? caseSlug}
            </p>
            <div className="mt-1 space-y-0.5">
              {caseSubNav.map(item => (
                <Link
                  key={item.tab}
                  href={`/case/${caseSlug}?tab=${item.tab}`}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="border-t border-gray-200 p-4 text-xs text-gray-400">
        Juicios v2.0
      </div>
    </aside>
  )
}
