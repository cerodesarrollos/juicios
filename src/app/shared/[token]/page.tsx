'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Case, TransactionWithParties, Evidence, Party } from '@/lib/types'
import { formatUSD, formatDate, statusBadge, typeColor, statusBadgeClass, evidenceSlotLabel, evidenceStatusBadge } from '@/lib/utils'

const EVIDENCE_SLOTS = ['comprobante', 'captura', 'audio', 'transcripcion']

export default function SharedViewPage() {
  const params = useParams()
  const token = params.token as string
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [transactions, setTransactions] = useState<TransactionWithParties[]>([])
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [parties, setParties] = useState<Party[]>([])

  useEffect(() => {
    fetch(`/api/shared/${token}`)
      .then(r => {
        if (!r.ok) throw new Error('Enlace invalido o expirado')
        return r.json()
      })
      .then(data => {
        setCaseData(data.case)
        setTransactions(data.transactions)
        setEvidence(data.evidence)
        setParties(data.parties)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return <div className="py-20 text-center text-gray-500">Cargando...</div>
  }

  if (error || !caseData) {
    return (
      <div className="py-20 text-center">
        <p className="text-xl font-semibold text-red-600">Enlace invalido</p>
        <p className="mt-2 text-gray-500">{error ?? 'No se encontro el caso'}</p>
      </div>
    )
  }

  const paid = caseData.total_paid_usd
  const pending = caseData.total_debt_usd - paid
  const paidPct = caseData.total_debt_usd > 0 ? Math.round((paid / caseData.total_debt_usd) * 100) : 0

  const evidenceByTx: Record<string, Evidence[]> = {}
  for (const e of evidence) {
    if (e.transaction_id) {
      if (!evidenceByTx[e.transaction_id]) evidenceByTx[e.transaction_id] = []
      evidenceByTx[e.transaction_id].push(e)
    }
  }

  const phases: Record<string, TransactionWithParties[]> = {}
  for (const tx of transactions) {
    if (!phases[tx.phase_name]) phases[tx.phase_name] = []
    phases[tx.phase_name].push(tx)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-green-800 uppercase tracking-wider">Vista Compartida (Solo Lectura)</p>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">{caseData.title}</h1>
            <p className="mt-1 text-sm text-gray-500">{caseData.description}</p>
          </div>
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">{caseData.status}</span>
        </div>
      </div>

      {/* Parties */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-green-800">Demandante</h3>
          <p className="mt-1 text-lg font-bold text-gray-900">{caseData.plaintiff_name}</p>
          <p className="text-sm text-gray-500">CUIL: {caseData.plaintiff_cuil}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-red-600">Demandado</h3>
          <p className="mt-1 text-lg font-bold text-gray-900">{caseData.defendant_name}</p>
          <p className="text-sm text-gray-500">CUIL: {caseData.defendant_cuil}</p>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-red-500">{formatUSD(caseData.total_debt_usd)}</p>
            <p className="text-xs text-gray-500">Deuda Total</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{formatUSD(paid)}</p>
            <p className="text-xs text-gray-500">Pagado</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">{formatUSD(pending)}</p>
            <p className="text-xs text-gray-500">Pendiente</p>
          </div>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full rounded-full bg-green-600" style={{ width: `${paidPct}%` }} />
        </div>
        <p className="mt-2 text-center text-sm text-gray-500">{paidPct}% cobrado</p>
      </div>

      {/* Parties list */}
      {parties.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Partes ({parties.length})</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {parties.map(p => (
              <div key={p.id} className="rounded-xl bg-gray-50 p-3 text-sm">
                <p className="font-medium text-gray-900">{p.name}</p>
                <p className="text-xs text-gray-500 capitalize">{p.role}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions by phase */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Transacciones ({transactions.length})</h3>
        {Object.entries(phases).map(([phase, phaseTxs]) => {
          const phaseTotal = phaseTxs.reduce((s, t) => s + (t.amount_usd ?? 0), 0)
          return (
            <div key={phase} className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-200 bg-green-50 p-4">
                <h4 className="text-sm font-semibold text-green-800">{phase}</h4>
                <span className="text-sm font-bold text-gray-900">{formatUSD(phaseTotal)}</span>
              </div>
              <div className="divide-y divide-gray-100">
                {phaseTxs.map(tx => {
                  const txEvidence = evidenceByTx[tx.id] ?? []
                  return (
                    <div key={tx.id} className="p-4 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="rounded-lg bg-green-800 px-2.5 py-1 text-xs font-semibold text-white">{tx.proof_id}</span>
                        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${typeColor(tx.type)}`}>{tx.type}</span>
                        <span className="text-xs text-gray-500">{formatDate(tx.date)}</span>
                        <span className="ml-auto text-sm font-bold text-gray-900">{formatUSD(tx.amount_usd)}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(tx.status)}`}>
                          {statusBadge(tx.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{tx.concept}</p>
                      <div className="flex flex-wrap gap-2">
                        {EVIDENCE_SLOTS.map(slot => {
                          const ev = txEvidence.find(e => e.slot === slot)
                          return (
                            <span key={slot} className="rounded-lg bg-gray-50 border border-gray-100 px-2.5 py-1 text-xs text-gray-600">
                              {evidenceSlotLabel(slot)}: {ev ? evidenceStatusBadge(ev.status) : 'Pendiente'}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-center text-xs text-gray-400 py-4">
        Generado por Juicios v2.0 — Vista de solo lectura
      </div>
    </div>
  )
}
