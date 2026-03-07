'use client'

import { useState, useMemo } from 'react'
import { Evidence, Transcription } from '@/lib/types'
import { evidenceSlotLabel, evidenceStatusBadge } from '@/lib/utils'

const SLOTS = ['comprobante', 'captura', 'audio', 'transcripcion']

interface Props {
  evidence: Evidence[]
  transactions: { id: string; proof_id: string; concept: string }[]
  transcriptions: Transcription[]
}

export default function EvidenceView({ evidence, transactions, transcriptions }: Props) {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [filterSlot, setFilterSlot] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Build a matrix: for each transaction, show 4 slots with evidence status
  const matrix = useMemo(() => {
    return transactions.map(tx => {
      const txEvidence = evidence.filter(e => e.transaction_id === tx.id)
      const slots = SLOTS.map(slot => {
        const ev = txEvidence.find(e => e.slot === slot)
        return { slot, evidence: ev ?? null }
      })
      return { transaction: tx, slots }
    })
  }, [evidence, transactions])

  const transcriptionMap = useMemo(() => {
    const map: Record<string, Transcription> = {}
    for (const t of transcriptions) {
      map[t.evidence_id] = t
    }
    return map
  }, [transcriptions])

  if (evidence.length === 0 && transactions.length > 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-text-muted">No hay evidencia cargada aún. Matriz de slots pendientes:</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th className="p-3">Prueba</th>
                {SLOTS.map(s => (
                  <th key={s} className="p-3">{evidenceSlotLabel(s)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-white/[0.02]">
                  <td className="p-3 font-mono font-bold text-accent">{tx.proof_id}</td>
                  {SLOTS.map(s => (
                    <td key={s} className="p-3 text-text-muted">⏳ Pendiente</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const filteredEvidence = evidence.filter(e => {
    if (filterSlot && e.slot !== filterSlot) return false
    if (filterStatus && e.status !== filterStatus) return false
    return true
  })

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setView('grid')}
            className={`px-3 py-1.5 text-sm ${view === 'grid' ? 'bg-accent text-black' : 'bg-card text-text-muted'}`}
          >
            Grilla
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1.5 text-sm ${view === 'list' ? 'bg-accent text-black' : 'bg-card text-text-muted'}`}
          >
            Lista
          </button>
        </div>
        <select value={filterSlot} onChange={e => setFilterSlot(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-text">
          <option value="">Todos los slots</option>
          {SLOTS.map(s => <option key={s} value={s}>{evidenceSlotLabel(s)}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-text">
          <option value="">Todos los estados</option>
          <option value="adjuntado">Adjuntado</option>
          <option value="pendiente">Pendiente</option>
          <option value="no_existe">No existe</option>
        </select>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvidence.map(ev => {
            const tx = transactions.find(t => t.id === ev.transaction_id)
            const transcription = transcriptionMap[ev.id]
            const isAudio = ev.mime_type?.startsWith('audio/')
            return (
              <div key={ev.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-accent">{ev.proof_id ?? tx?.proof_id ?? '—'}</span>
                  <span className="text-xs">{evidenceStatusBadge(ev.status)}</span>
                </div>
                <p className="text-sm text-text-muted">{evidenceSlotLabel(ev.slot)}</p>
                <p className="truncate text-sm">{ev.file_name}</p>
                {isAudio && ev.file_url && (
                  <audio controls className="w-full mt-2" preload="none">
                    <source src={ev.file_url} type={ev.mime_type ?? 'audio/ogg'} />
                  </audio>
                )}
                {transcription && (
                  <div className="mt-2 rounded-lg bg-bg p-3 text-xs text-text-muted">
                    <p className="font-medium text-text mb-1">Transcripción:</p>
                    <p>{transcription.text}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
          {filteredEvidence.map(ev => {
            const tx = transactions.find(t => t.id === ev.transaction_id)
            return (
              <div key={ev.id} className="flex items-center gap-4 p-4">
                <span className="font-mono text-sm font-bold text-accent w-16">{ev.proof_id ?? tx?.proof_id ?? '—'}</span>
                <span className="text-sm text-text-muted w-28">{evidenceSlotLabel(ev.slot)}</span>
                <span className="flex-1 truncate text-sm">{ev.file_name}</span>
                <span className="text-xs">{evidenceStatusBadge(ev.status)}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
