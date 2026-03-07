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
        <p className="text-sm text-gray-500">No hay evidencia cargada aún. Matriz de slots pendientes:</p>
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="p-3 font-medium">Prueba</th>
                {SLOTS.map(s => (
                  <th key={s} className="p-3 font-medium">{evidenceSlotLabel(s)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="p-3 font-mono font-bold text-green-800">{tx.proof_id}</td>
                  {SLOTS.map(s => (
                    <td key={s} className="p-3 text-gray-400">⏳ Pendiente</td>
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
        <div className="flex rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <button
            onClick={() => setView('grid')}
            className={`px-4 py-2 text-sm font-medium ${view === 'grid' ? 'bg-green-800 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
          >
            Grilla
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 text-sm font-medium ${view === 'list' ? 'bg-green-800 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
          >
            Lista
          </button>
        </div>
        <select value={filterSlot} onChange={e => setFilterSlot(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm">
          <option value="">Todos los slots</option>
          {SLOTS.map(s => <option key={s} value={s}>{evidenceSlotLabel(s)}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm">
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
              <div key={ev.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-green-800 px-2.5 py-1 text-xs font-semibold text-white">{ev.proof_id ?? tx?.proof_id ?? '—'}</span>
                  <span className="text-xs">{evidenceStatusBadge(ev.status)}</span>
                </div>
                <p className="text-sm text-gray-500">{evidenceSlotLabel(ev.slot)}</p>
                <p className="truncate text-sm text-gray-900">{ev.file_name}</p>
                {isAudio && ev.file_url && (
                  <audio controls className="w-full mt-2" preload="none">
                    <source src={ev.file_url} type={ev.mime_type ?? 'audio/ogg'} />
                  </audio>
                )}
                {transcription && (
                  <div className="mt-2 rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
                    <p className="font-medium text-gray-700 mb-1">Transcripción:</p>
                    <p>{transcription.text}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100 overflow-hidden">
          {filteredEvidence.map(ev => {
            const tx = transactions.find(t => t.id === ev.transaction_id)
            return (
              <div key={ev.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <span className="rounded-lg bg-green-800 px-2.5 py-1 text-xs font-semibold text-white w-16 text-center">{ev.proof_id ?? tx?.proof_id ?? '—'}</span>
                <span className="text-sm text-gray-500 w-28">{evidenceSlotLabel(ev.slot)}</span>
                <span className="flex-1 truncate text-sm text-gray-900">{ev.file_name}</span>
                <span className="text-xs">{evidenceStatusBadge(ev.status)}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
