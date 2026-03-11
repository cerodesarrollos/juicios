'use client'

import { useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const STORAGE_BASE = 'https://eacrjsuyiraaizeitfth.supabase.co/storage/v1/object/public/case-files/caso-toro/documents'

interface DocItem {
  name: string
  label: string
  category: string
  url: string
  type: 'pdf' | 'csv'
}

const DOCS: DocItem[] = [
  // Multas
  { name: 'multa-G05014978', label: 'Acta G05014978', category: 'Multas', url: `${STORAGE_BASE}/multa-G05014978.pdf`, type: 'pdf' },
  { name: 'multa-G05016404', label: 'Acta G05016404', category: 'Multas', url: `${STORAGE_BASE}/multa-G05016404.pdf`, type: 'pdf' },
  { name: 'multa-G05194012', label: 'Acta G05194012', category: 'Multas', url: `${STORAGE_BASE}/multa-G05194012.pdf`, type: 'pdf' },
  { name: 'multa-G05210610', label: 'Acta G05210610', category: 'Multas', url: `${STORAGE_BASE}/multa-G05210610.pdf`, type: 'pdf' },
  { name: 'multa-G05403255', label: 'Acta G05403255', category: 'Multas', url: `${STORAGE_BASE}/multa-G05403255.pdf`, type: 'pdf' },
  { name: 'multa-Q31986316', label: 'Acta Q31986316', category: 'Multas', url: `${STORAGE_BASE}/multa-Q31986316.pdf`, type: 'pdf' },
  { name: 'multa-Q32996946', label: 'Acta Q32996946', category: 'Multas', url: `${STORAGE_BASE}/multa-Q32996946.pdf`, type: 'pdf' },
  { name: 'multa-Q33005707', label: 'Acta Q33005707', category: 'Multas', url: `${STORAGE_BASE}/multa-Q33005707.pdf`, type: 'pdf' },
  { name: 'multa-Q33136024', label: 'Acta Q33136024', category: 'Multas', url: `${STORAGE_BASE}/multa-Q33136024.pdf`, type: 'pdf' },
  { name: 'multa-Q33158003', label: 'Acta Q33158003', category: 'Multas', url: `${STORAGE_BASE}/multa-Q33158003.pdf`, type: 'pdf' },
  { name: 'multa-Q33174013', label: 'Acta Q33174013', category: 'Multas', url: `${STORAGE_BASE}/multa-Q33174013.pdf`, type: 'pdf' },
  { name: 'multa-Q33194279', label: 'Acta Q33194279', category: 'Multas', url: `${STORAGE_BASE}/multa-Q33194279.pdf`, type: 'pdf' },
  { name: 'multa-Q35376691', label: 'Acta Q35376691', category: 'Multas', url: `${STORAGE_BASE}/multa-Q35376691.pdf`, type: 'pdf' },
  { name: 'multa-Q35451523', label: 'Acta Q35451523', category: 'Multas', url: `${STORAGE_BASE}/multa-Q35451523.pdf`, type: 'pdf' },
  { name: 'multa-Q35576279', label: 'Acta Q35576279', category: 'Multas', url: `${STORAGE_BASE}/multa-Q35576279.pdf`, type: 'pdf' },
  { name: 'multa-Q35689193', label: 'Acta Q35689193', category: 'Multas', url: `${STORAGE_BASE}/multa-Q35689193.pdf`, type: 'pdf' },
  // BCRA
  { name: 'bcra-chaves', label: 'BCRA - Chaves Franco Maximiliano', category: 'Informes BCRA', url: `${STORAGE_BASE}/informe-bcra-chaves-franco.pdf`, type: 'pdf' },
  { name: 'bcra-forever', label: 'BCRA - Forever 463 S.A.S.', category: 'Informes BCRA', url: `${STORAGE_BASE}/informe-bcra-forever-463-sas.pdf`, type: 'pdf' },
  // DNRPA
  { name: 'dnrpa-ira464', label: 'Histórico Dominio IRA464 (Audi TT)', category: 'Informes DNRPA', url: `${STORAGE_BASE}/informe-dnrpa-IRA464-historico.pdf`, type: 'pdf' },
  // TelePASE
  { name: 'telepase-sept', label: 'TelePASE Septiembre 2025', category: 'TelePASE', url: `${STORAGE_BASE}/telepase-IRA464-septiembre2025.csv`, type: 'csv' },
  { name: 'telepase-oct', label: 'TelePASE Octubre 2025', category: 'TelePASE', url: `${STORAGE_BASE}/telepase-IRA464-octubre2025.csv`, type: 'csv' },
]

const CATEGORIES = ['Multas', 'Informes BCRA', 'Informes DNRPA', 'TelePASE']
const CATEGORY_ICONS: Record<string, string> = {
  'Multas': '🚫',
  'Informes BCRA': '🏦',
  'Informes DNRPA': '🚗',
  'TelePASE': '🛣️',
}

function CSVViewer({ url }: { url: string }) {
  const [rows, setRows] = useState<string[][]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(url)
      .then(r => r.text())
      .then(text => {
        const lines = text.trim().split('\n')
        if (lines.length > 0) {
          const sep = lines[0].includes(';') ? ';' : ','
          setHeaders(lines[0].split(sep))
          setRows(lines.slice(1).map(l => l.split(sep)))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [url])

  if (loading) return <div className="flex justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-2 border-green-500 border-t-transparent" /></div>

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs">
        <thead>
          <tr className="bg-white/[0.06]">
            {headers.map((h, i) => (
              <th key={i} className="whitespace-nowrap border-b border-white/[0.08] px-3 py-2 text-left font-semibold text-white/70">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="hover:bg-white/[0.04] transition-colors">
              {row.map((cell, ci) => (
                <td key={ci} className="whitespace-nowrap border-b border-white/[0.05] px-3 py-1.5 text-white/60">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function DocsPage() {
  const searchParams = useSearchParams()
  const docParam = searchParams.get('doc')
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    if (docParam) {
      // Map sidebar slugs to categories
      const slugMap: Record<string, string> = {
        'informes-dnrpa': 'Informes DNRPA',
        'informe-bcra': 'Informes BCRA',
        'informe-veraz': 'Informe Veraz',
        'historial-multas': 'Multas',
        'telepase': 'TelePASE',
        'certificacion-notarial': 'Certificación Notarial',
      }
      const cat = slugMap[docParam]
      if (cat) setActiveCategory(cat)
    }
  }, [docParam])

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0d0d14] px-4 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-white/80">📋 Documentación Respaldatoria</h1>
          {activeCategory && (
            <span className="rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-400">
              {activeCategory}
            </span>
          )}
        </div>
        <div className="text-xs text-white/30">
          {DOCS.length} documentos
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Document list — left panel */}
        <div className="w-full md:w-[360px] flex-shrink-0 overflow-y-auto border-r border-white/[0.08] bg-[#0d0d14]">
          {CATEGORIES.map(cat => {
            const catDocs = DOCS.filter(d => d.category === cat)
            if (catDocs.length === 0) return null
            const isActive = activeCategory === cat

            return (
              <div key={cat}>
                <button
                  onClick={() => setActiveCategory(isActive ? null : cat)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/[0.04] transition-colors border-b border-white/[0.06]"
                >
                  <div className="flex items-center gap-2">
                    <span>{CATEGORY_ICONS[cat] || '📄'}</span>
                    <span className="text-sm font-semibold text-white/80">{cat}</span>
                    <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] font-medium text-white/50">
                      {catDocs.length}
                    </span>
                  </div>
                  <svg
                    width="12" height="12" viewBox="0 0 12 12" fill="currentColor"
                    className={`text-white/30 transition-transform duration-200 ${isActive ? 'rotate-90' : ''}`}
                  >
                    <path d="M4 2l5 4-5 4z" />
                  </svg>
                </button>

                {isActive && (
                  <div className="bg-white/[0.02]">
                    {catDocs.map(doc => (
                      <button
                        key={doc.name}
                        onClick={() => setSelectedDoc(doc)}
                        className={`flex w-full items-center gap-3 px-6 py-2.5 text-left text-xs transition-colors border-b border-white/[0.05] ${
                          selectedDoc?.name === doc.name
                            ? 'bg-green-900/30 text-green-400 font-semibold'
                            : 'text-white/60 hover:bg-white/[0.04] hover:text-white/80'
                        }`}
                      >
                        <span className="text-base">{doc.type === 'pdf' ? '📄' : '📊'}</span>
                        <span className="truncate">{doc.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {/* Empty categories placeholder */}
          {['Informe Veraz', 'Certificación Notarial'].map(cat => (
            <div key={cat} className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] opacity-40">
              <div className="flex items-center gap-2">
                <span>{cat === 'Informe Veraz' ? '📋' : '📝'}</span>
                <span className="text-sm font-semibold text-white/50">{cat}</span>
              </div>
              <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] text-white/30">Pendiente</span>
            </div>
          ))}
        </div>

        {/* Document viewer — right panel */}
        <div className="hidden md:flex flex-1 flex-col overflow-hidden bg-[#111119]">
          {selectedDoc ? (
            <>
              <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0d0d14] px-5 py-3">
                <div>
                  <h2 className="text-sm font-semibold text-white/80">{selectedDoc.label}</h2>
                  <p className="text-xs text-white/30 mt-0.5">{selectedDoc.category}</p>
                </div>
                <a
                  href={selectedDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-green-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600 transition-colors"
                >
                  Abrir ↗
                </a>
              </div>
              <div className="flex-1 overflow-auto">
                {selectedDoc.type === 'pdf' ? (
                  <iframe
                    src={selectedDoc.url}
                    className="h-full w-full"
                    title={selectedDoc.label}
                  />
                ) : (
                  <div className="p-4">
                    <CSVViewer url={selectedDoc.url} />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-white/30 p-8">
              <span className="text-5xl mb-4">📂</span>
              <p className="text-sm text-center">Seleccioná un documento para previsualizarlo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
