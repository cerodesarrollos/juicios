'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { CaseSummary } from '@/lib/types'
import CaseCard from '@/components/CaseCard'
import CaseForm from '@/components/CaseForm'

export default function HomeClient({ cases }: { cases: CaseSummary[] }) {
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const router = useRouter()

  const filtered = useMemo(() => {
    if (!search) return cases
    const q = search.toLowerCase()
    return cases.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.plaintiff_name.toLowerCase().includes(q) ||
      c.defendant_name.toLowerCase().includes(q) ||
      c.status.toLowerCase().includes(q)
    )
  }, [cases, search])

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[24px] font-medium text-white/90 tracking-tight">Casos</h1>
          <p className="mt-1 text-[13px] text-white/30">{cases.length} caso(s) registrado(s)</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center px-5 py-2.5 rounded-[14px] bg-[#1e1e22] text-white/80 font-bold text-[13px] border border-white/[0.08] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),inset_0_-1px_0_rgba(255,255,255,0.04)] transition-all duration-150 hover:bg-[#222226] active:shadow-[inset_0_3px_6px_rgba(0,0,0,0.6)]"
        >
          + Nuevo Caso
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar casos por titulo, partes, estado..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full rounded-[14px] border border-white/[0.08] bg-[#161619] px-4 py-2.5 text-[13px] text-white/80 placeholder:text-white/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus:border-white/[0.15] focus:outline-none"
      />

      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-white/25 text-lg">No hay casos</p>
          <p className="text-white/15 text-[13px] mt-1">Crea tu primer caso para comenzar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(c => (
            <CaseCard key={c.id} summary={c} />
          ))}
        </div>
      )}

      <CaseForm
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSaved={() => router.refresh()}
      />
    </div>
  )
}
