'use client'

import { useState, useMemo } from 'react'
import { Transaction, Evidence } from '@/lib/types'
import { formatUSD, formatDate, statusBadge, typeColor, statusBadgeClass, evidenceSlotLabel, evidenceStatusBadge } from '@/lib/utils'

const EVIDENCE_SLOTS = ['comprobante', 'captura', 'audio', 'transcripcion']

interface Props {
  transactions: (Transaction & { from_party: { name: string } | null; to_party: { name: string } | null })[]
  evidence: Evidence[]
}

export default function TransactionsList({ transactions, evidence }: Props) {
  const [search, setSearch] = useState('')
  const [filterPhase, setFilterPhase] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const phases = useMemo(() => [...new Set(transactions.map(t => t.phase_name))], [transactions])
  const types = useMemo(() => [...new Set(transactions.map(t => t.type))], [transactions])
  const statuses = useMemo(() => [...new Set(transactions.map(t => t.status))], [transactions])

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (search) {
        const q = search.toLowerCase()
        if (!t.proof_id.toLowerCase().includes(q) && !t.concept.toLowerCase().includes(q) && !t.date.includes(q)) return false
      }
      if (filterPhase && t.phase_name !== filterPhase) return false
      if (filterType && t.type !== filterType) return false
      if (filterStatus && t.status !== filterStatus) return false
      return true
    })
  }, [transactions, search, filterPhase, filterType, filterStatus])

  const evidenceByTx = useMemo(() => {
    const map: Record<string, Evidence[]> = {}
    for (const e of evidence) {
      if (e.transaction_id) {
        if (!map[e.transaction_id]) map[e.transaction_id] = []
        map[e.transaction_id].push(e)
      }
    }
    return map
  }, [evidence])

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por prueba, fecha, concepto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none"
        />
        <select value={filterPhase} onChange={(e) => setFilterPhase(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm">
          <option value="">Todas las fases</option>
          {phases.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm">
          <option value="">Todos los tipos</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm">
          <option value="">Todos los estados</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <p className="text-sm text-gray-500">{filtered.length} resultado(s)</p>

      {/* Grouped by phase */}
      {phases.filter(p => !filterPhase || p === filterPhase).map(phase => {
        const phaseItems = filtered.filter(t => t.phase_name === phase)
        if (phaseItems.length === 0) return null
        return (
          <div key={phase} className="space-y-2">
            <h3 className="text-sm font-semibold text-green-800">{phase}</h3>
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100 overflow-hidden">
              {phaseItems.map(tx => {
                const txEvidence = evidenceByTx[tx.id] ?? []
                const isExpanded = expandedId === tx.id
                return (
                  <div key={tx.id}>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : tx.id)}
                      className="flex w-full items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="rounded-lg bg-green-800 px-2.5 py-1 text-xs font-semibold text-white">{tx.proof_id}</span>
                      <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${typeColor(tx.type)}`}>
                        {tx.type}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-gray-900">{tx.concept}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(tx.date)} · {tx.from_party?.name ?? '—'} → {tx.to_party?.name ?? '—'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{formatUSD(tx.amount_usd)}</p>
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(tx.status)}`}>
                          {statusBadge(tx.status)} {tx.status}
                        </span>
                      </div>
                      <span className="text-gray-400">{isExpanded ? '▲' : '▼'}</span>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-gray-100 bg-gray-50 p-4">
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                          {EVIDENCE_SLOTS.map(slot => {
                            const ev = txEvidence.find(e => e.slot === slot)
                            return (
                              <div key={slot} className="rounded-xl border border-gray-200 bg-white p-3">
                                <p className="text-xs font-medium text-gray-500">{evidenceSlotLabel(slot)}</p>
                                <p className="mt-1 text-sm">
                                  {ev ? evidenceStatusBadge(ev.status) : '⏳ Pendiente'}
                                </p>
                                {ev?.file_name && (
                                  <p className="mt-1 truncate text-xs text-gray-400">{ev.file_name}</p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                        {tx.notes && (
                          <p className="mt-3 text-sm text-gray-500">📝 {tx.notes}</p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                          <span>Método: {tx.method}</span>
                          <span>Dirección: {tx.direction}</span>
                          {tx.amount_ars && <span>ARS: ${tx.amount_ars.toLocaleString()}</span>}
                          {tx.amount_usdt && <span>USDT: {tx.amount_usdt}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
