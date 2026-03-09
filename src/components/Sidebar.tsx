'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Chapter {
  chapter: number
  name: string
  count: number
}

export default function Sidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
  const pathname = usePathname()
  const [caseName, setCaseName] = useState<string | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [docsOpen, setDocsOpen] = useState(false)
  const [chapters, setChapters] = useState<Chapter[]>([])

  const caseMatch = pathname.match(/^\/case\/([^/]+)/)
  const caseSlug = caseMatch ? caseMatch[1] : null
  const isChatPage = pathname.includes('/chat')

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

  const linkBase = 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors'
  const linkInactive = 'text-white/40 hover:bg-white/[0.04] hover:text-white/70'
  const linkActive = 'bg-white/[0.06] text-white/90 font-semibold'

  return (
    <aside className="no-print flex h-full w-56 flex-shrink-0 flex-col border-r border-white/[0.06] bg-[#111114]">
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <Link
          href="/"
          className={`${linkBase} ${pathname === '/' ? linkActive : linkInactive}`}
        >
          <span>&#127968;</span>
          <span>Inicio</span>
        </Link>

        {caseSlug && (
          <div className="mt-4">
            <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/20">
              Caso Actual
            </p>
            <p className="px-3 py-1 text-sm font-semibold text-white/70 truncate">
              {caseName ?? caseSlug}
            </p>
            <div className="mt-1 space-y-0.5">
              {caseSubNav.map(item => (
                <Link
                  key={item.tab}
                  href={`/case/${caseSlug}?tab=${item.tab}`}
                  className={`${linkBase} ${linkInactive}`}
                >
                  <span>{item.label}</span>
                </Link>
              ))}

              <Link
                href={`/case/${caseSlug}/strategy`}
                onClick={onNavigate}
                className={`${linkBase} ${pathname.includes('/strategy') ? linkActive : linkInactive}`}
              >
                <span>⚖️ Estrategia</span>
              </Link>

              <Link
                href={`/case/${caseSlug}/adversarial`}
                onClick={onNavigate}
                className={`${linkBase} ${pathname.includes('/adversarial') ? linkActive : linkInactive}`}
              >
                <span>Sim. Adversarial</span>
              </Link>

              {/* Chat */}
              <div>
                <button
                  onClick={() => setChatOpen(!chatOpen)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isChatPage ? linkActive : linkInactive
                  }`}
                >
                  <span>💬 Chat</span>
                  <svg
                    width="12" height="12" viewBox="0 0 12 12" fill="currentColor"
                    className={`transition-transform duration-200 ${chatOpen ? 'rotate-90' : ''}`}
                  >
                    <path d="M4 2l5 4-5 4z" />
                  </svg>
                </button>

                {chatOpen && (
                  <div className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-white/[0.06] pl-2">
                    <Link
                      href={`/case/${caseSlug}/chat`}
                      className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        isChatPage ? 'text-white/60 hover:bg-white/[0.04]' : linkInactive
                      }`}
                    >
                      <span>Chat Completo</span>
                    </Link>

                    {chapters.map(ch => (
                      <Link
                        key={ch.chapter}
                        href={`/case/${caseSlug}/chat?chapter=${ch.chapter}`}
                        className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium ${linkInactive}`}
                      >
                        <span className="truncate">{ch.chapter}. {ch.name}</span>
                        <span className="ml-1 flex-shrink-0 rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-white/25">
                          {ch.count}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Doc Respaldatoria */}
              <div>
                <button
                  onClick={() => setDocsOpen(!docsOpen)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium ${linkInactive}`}
                >
                  <span>📋 Doc. Respaldatoria</span>
                  <svg
                    width="12" height="12" viewBox="0 0 12 12" fill="currentColor"
                    className={`transition-transform duration-200 ${docsOpen ? 'rotate-90' : ''}`}
                  >
                    <path d="M4 2l5 4-5 4z" />
                  </svg>
                </button>

                {docsOpen && (
                  <div className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-white/[0.06] pl-2">
                    {[
                      { label: 'Informes DNRPA', slug: 'informes-dnrpa' },
                      { label: 'Informe BCRA', slug: 'informe-bcra' },
                      { label: 'Informe Veraz', slug: 'informe-veraz' },
                      { label: 'Historial Multas', slug: 'historial-multas' },
                      { label: 'TelePASE', slug: 'telepase' },
                      { label: 'Certificación Notarial', slug: 'certificacion-notarial' },
                    ].map(doc => (
                      <Link
                        key={doc.slug}
                        href={`/case/${caseSlug}/docs?doc=${doc.slug}`}
                        className={`flex items-center rounded-lg px-3 py-1.5 text-xs font-medium ${linkInactive}`}
                      >
                        <span>{doc.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className="border-t border-white/[0.06] p-4 text-xs text-white/20">
        Juicios v2.0
      </div>
    </aside>
  )
}
