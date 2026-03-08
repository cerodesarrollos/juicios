'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Chapter {
  chapter: number
  name: string
  count: number
}

export default function Sidebar() {
  const pathname = usePathname()
  const [caseName, setCaseName] = useState<string | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [chapters, setChapters] = useState<Chapter[]>([])

  const caseMatch = pathname.match(/^\/case\/([^/]+)/)
  const caseSlug = caseMatch ? caseMatch[1] : null
  const isChatPage = pathname.includes('/chat')

  // Auto-open chat submenu when on chat page
  useEffect(() => {
    if (isChatPage) setChatOpen(true)
  }, [isChatPage])

  useEffect(() => {
    if (!caseSlug) {
      setCaseName(null)
      setChapters([])
      return
    }
    fetch(`/api/cases?slug=${caseSlug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.title) setCaseName(data.title)
        else setCaseName(caseSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
        if (data?.id) {
          fetch(`/api/chat-chapters?case_id=${data.id}`)
            .then(r => r.ok ? r.json() : [])
            .then((chs: Chapter[]) => setChapters(chs.sort((a, b) => a.chapter - b.chapter)))
            .catch(() => {})
        }
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
    <aside className="no-print flex w-56 flex-shrink-0 flex-col border-r border-gray-200 bg-white">
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

              {/* Chat with expandable chapters */}
              <div>
                <button
                  onClick={() => setChatOpen(!chatOpen)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isChatPage
                      ? 'bg-green-50 text-green-800 font-semibold'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span>💬 Chat</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="currentColor"
                    className={`transition-transform duration-200 ${chatOpen ? 'rotate-90' : ''}`}
                  >
                    <path d="M4 2l5 4-5 4z" />
                  </svg>
                </button>

                {chatOpen && (
                  <div className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-gray-100 pl-2">
                    {/* Chat Completo */}
                    <Link
                      href={`/case/${caseSlug}/chat`}
                      className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        isChatPage ? 'text-green-700 hover:bg-green-50' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span>Chat Completo</span>
                    </Link>

                    {/* Chapters ordered */}
                    {chapters.map(ch => (
                      <Link
                        key={ch.chapter}
                        href={`/case/${caseSlug}/chat?chapter=${ch.chapter}`}
                        className="flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      >
                        <span className="truncate">{ch.chapter}. {ch.name}</span>
                        <span className="ml-1 flex-shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-400">
                          {ch.count}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
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
