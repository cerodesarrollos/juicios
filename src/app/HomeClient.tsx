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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Casos</h1>
          <p className="mt-1 text-sm text-gray-500">{cases.length} caso(s) registrado(s)</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="rounded-xl bg-green-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 transition-colors"
        >
          + Nuevo Caso
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Buscar casos por titulo, partes, estado..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none"
      />

      {/* Case grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-gray-400 text-lg">No hay casos</p>
          <p className="text-gray-400 text-sm mt-1">Crea tu primer caso para comenzar</p>
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
