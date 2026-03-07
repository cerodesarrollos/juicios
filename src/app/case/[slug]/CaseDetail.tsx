'use client'

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Case, Party, Evidence, Transcription, TimelineEvent, ActivityLog, BankAccount, TransactionWithParties, Transaction } from '@/lib/types'
import { formatUSD, formatDate, statusBadge, typeColor, statusBadgeClass, evidenceSlotLabel, evidenceStatusBadge } from '@/lib/utils'
import CaseForm from '@/components/CaseForm'
import TransactionForm from '@/components/TransactionForm'
import PartyForm from '@/components/PartyForm'
import ConfirmDialog from '@/components/ConfirmDialog'
import EvidenceUploader from '@/components/EvidenceUploader'
import AudioPlayer from '@/components/AudioPlayer'
import ActivityFeed from '@/components/ActivityFeed'
import PDFExport from '@/components/PDFExport'
import StatsBar from '@/components/StatsBar'

const EVIDENCE_SLOTS = ['comprobante', 'captura', 'audio', 'transcripcion']
type Tab = 'resumen' | 'transacciones' | 'evidencia' | 'partes' | 'timeline' | 'config'

interface Props {
  caseData: Case
  transactions: TransactionWithParties[]
  evidence: Evidence[]
  parties: Party[]
  bankAccounts: BankAccount[]
  transcriptions: Transcription[]
  timelineEvents: TimelineEvent[]
  activityLog: ActivityLog[]
}

export default function CaseDetail({ caseData, transactions, evidence, parties, bankAccounts, transcriptions, timelineEvents, activityLog }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = (searchParams.get('tab') as Tab) || 'resumen'
  const [tab, setTab] = useState<Tab>(initialTab)

  // Modal states
  const [showEditCase, setShowEditCase] = useState(false)
  const [showCreateTx, setShowCreateTx] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | null>(null)
  const [showCreateParty, setShowCreateParty] = useState(false)
  const [editingParty, setEditingParty] = useState<Party | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; label: string } | null>(null)
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null)
  const [txSearch, setTxSearch] = useState('')
  const [txFilterPhase, setTxFilterPhase] = useState('')
  const [txFilterType, setTxFilterType] = useState('')
  const [txFilterStatus, setTxFilterStatus] = useState('')
  const [sharedLink, setSharedLink] = useState<string | null>(null)
  const [generatingLink, setGeneratingLink] = useState(false)

  function refresh() { router.refresh() }

  async function handleDelete() {
    if (!deleteTarget) return
    const urlMap: Record<string, string> = {
      transaction: `/api/transactions/${deleteTarget.id}`,
      party: `/api/parties/${deleteTarget.id}`,
      case: `/api/cases/${deleteTarget.id}`,
    }
    await fetch(urlMap[deleteTarget.type], { method: 'DELETE' })
    setDeleteTarget(null)
    if (deleteTarget.type === 'case') {
      router.push('/')
    } else {
      refresh()
    }
  }

  // Computed
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

  const transcriptionMap = useMemo(() => {
    const map: Record<string, Transcription> = {}
    for (const t of transcriptions) map[t.evidence_id] = t
    return map
  }, [transcriptions])

  const nextProofId = `P-${String(transactions.length + 1).padStart(3, '0')}`

  const phases = useMemo(() => [...new Set(transactions.map(t => t.phase_name))], [transactions])
  const txTypes = useMemo(() => [...new Set(transactions.map(t => t.type))], [transactions])
  const txStatuses = useMemo(() => [...new Set(transactions.map(t => t.status))], [transactions])

  const filteredTx = useMemo(() => {
    return transactions.filter(t => {
      if (txSearch) {
        const q = txSearch.toLowerCase()
        if (!t.proof_id.toLowerCase().includes(q) && !t.concept.toLowerCase().includes(q) && !t.date.includes(q)) return false
      }
      if (txFilterPhase && t.phase_name !== txFilterPhase) return false
      if (txFilterType && t.type !== txFilterType) return false
      if (txFilterStatus && t.status !== txFilterStatus) return false
      return true
    })
  }, [transactions, txSearch, txFilterPhase, txFilterType, txFilterStatus])

  const paid = caseData.total_paid_usd
  const pending = caseData.total_debt_usd - paid
  const paidPct = caseData.total_debt_usd > 0 ? Math.round((paid / caseData.total_debt_usd) * 100) : 0

  const caseSummary = {
    id: caseData.id,
    slug: caseData.slug,
    title: caseData.title,
    status: caseData.status,
    plaintiff_name: caseData.plaintiff_name,
    defendant_name: caseData.defendant_name,
    total_debt_usd: caseData.total_debt_usd,
    total_paid_usd: paid,
    pending_usd: pending,
    total_transactions: transactions.length,
    total_evidence: evidence.length,
    evidence_complete: evidence.filter(e => e.status === 'adjuntado').length,
    evidence_pending: evidence.filter(e => e.status === 'pendiente').length,
    total_transcriptions: transcriptions.length,
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'resumen', label: 'Resumen' },
    { key: 'transacciones', label: 'Transacciones' },
    { key: 'evidencia', label: 'Evidencia' },
    { key: 'partes', label: 'Partes' },
    { key: 'timeline', label: 'Timeline' },
    { key: 'config', label: 'Config' },
  ]

  async function generateSharedLink() {
    setGeneratingLink(true)
    try {
      const res = await fetch('/api/shared-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: caseData.id }),
      })
      const data = await res.json()
      setSharedLink(`${window.location.origin}/shared/${data.token}`)
    } finally {
      setGeneratingLink(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/" className="text-sm font-medium text-green-800 hover:underline">&larr; Todos los Casos</Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">{caseData.title}</h1>
          <p className="mt-1 text-sm text-gray-500">{caseData.plaintiff_name} vs {caseData.defendant_name}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">{caseData.status}</span>
          <PDFExport caseData={caseData} transactions={transactions} evidence={evidence} />
          <button onClick={() => setShowEditCase(true)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Editar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              tab === t.key ? 'bg-white text-green-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'resumen' && (
        <div className="space-y-6">
          <StatsBar summary={caseSummary} />

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-500">Progreso de cobro</span>
              <span className="font-semibold text-green-800">{paidPct}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-gray-200">
              <div className="h-full rounded-full bg-green-600 transition-all" style={{ width: `${paidPct}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>Pagado: {formatUSD(paid)}</span>
              <span>Restante: {formatUSD(pending)}</span>
            </div>
          </div>

          {caseData.description && (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Descripcion</h3>
              <p className="text-sm text-gray-600">{caseData.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
              <h3 className="font-semibold text-green-800">Demandante</h3>
              <p className="text-lg font-bold text-gray-900">{caseData.plaintiff_name}</p>
              <p className="text-sm text-gray-500">CUIL: {caseData.plaintiff_cuil}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
              <h3 className="font-semibold text-red-600">Demandado</h3>
              <p className="text-lg font-bold text-gray-900">{caseData.defendant_name}</p>
              <p className="text-sm text-gray-500">CUIL: {caseData.defendant_cuil}</p>
              {caseData.defendant_dni && <p className="text-sm text-gray-500">DNI: {caseData.defendant_dni}</p>}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Actividad Reciente</h3>
            <ActivityFeed logs={activityLog} />
          </div>
        </div>
      )}

      {tab === 'transacciones' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-gray-500">{filteredTx.length} de {transactions.length} transacciones</p>
            <button onClick={() => { setEditingTx(null); setShowCreateTx(true) }}
              className="rounded-xl bg-green-800 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
              + Nueva Transaccion
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <input type="text" placeholder="Buscar..." value={txSearch} onChange={e => setTxSearch(e.target.value)}
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none placeholder:text-gray-400" />
            <select value={txFilterPhase} onChange={e => setTxFilterPhase(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm">
              <option value="">Todas las fases</option>
              {phases.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={txFilterType} onChange={e => setTxFilterType(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm">
              <option value="">Todos los tipos</option>
              {txTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={txFilterStatus} onChange={e => setTxFilterStatus(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm">
              <option value="">Todos los estados</option>
              {txStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {phases.filter(p => !txFilterPhase || p === txFilterPhase).map(phase => {
            const phaseItems = filteredTx.filter(t => t.phase_name === phase)
            if (phaseItems.length === 0) return null
            const phaseTotal = phaseItems.reduce((s, t) => s + (t.amount_usd ?? 0), 0)
            return (
              <div key={phase} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-green-800">{phase}</h3>
                  <span className="text-sm font-bold text-gray-700">{formatUSD(phaseTotal)}</span>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm divide-y divide-gray-100 overflow-hidden">
                  {phaseItems.map(tx => {
                    const txEvidence = evidenceByTx[tx.id] ?? []
                    const isExpanded = expandedTxId === tx.id
                    return (
                      <div key={tx.id}>
                        <button onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                          className="flex w-full items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors">
                          <span className="rounded-lg bg-green-800 px-2.5 py-1 text-xs font-semibold text-white">{tx.proof_id}</span>
                          <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${typeColor(tx.type)}`}>{tx.type}</span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-gray-900">{tx.concept}</p>
                            <p className="text-xs text-gray-500">{formatDate(tx.date)} · {tx.from_party?.name ?? '—'} &rarr; {tx.to_party?.name ?? '—'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">{formatUSD(tx.amount_usd)}</p>
                            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(tx.status)}`}>
                              {statusBadge(tx.status)} {tx.status}
                            </span>
                          </div>
                          <span className="text-gray-400">{isExpanded ? '\u25B2' : '\u25BC'}</span>
                        </button>

                        {isExpanded && (
                          <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3">
                            <div className="flex gap-2">
                              <button onClick={() => { setEditingTx(tx); setShowCreateTx(true) }}
                                className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100">
                                Editar
                              </button>
                              <button onClick={() => setDeleteTarget({ type: 'transaction', id: tx.id, label: tx.proof_id })}
                                className="rounded-lg border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50">
                                Eliminar
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                              {EVIDENCE_SLOTS.map(slot => {
                                const ev = txEvidence.find(e => e.slot === slot)
                                const trans = ev ? transcriptionMap[ev.id] : undefined
                                const isAudio = ev?.file_type?.startsWith('audio/')
                                return (
                                  <div key={slot} className="rounded-xl border border-gray-200 bg-white p-3 space-y-2">
                                    <p className="text-xs font-medium text-gray-500">{evidenceSlotLabel(slot)}</p>
                                    {ev && ev.status === 'adjuntado' ? (
                                      <>
                                        <p className="text-xs text-green-600">{evidenceStatusBadge(ev.status)}</p>
                                        <p className="truncate text-xs text-gray-400">{ev.original_filename}</p>
                                        {isAudio && ev.file_url && (
                                          <AudioPlayer src={ev.file_url} transcription={trans?.text} />
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        <p className="text-xs text-gray-400">Pendiente</p>
                                        <EvidenceUploader
                                          caseSlug={caseData.slug}
                                          caseId={caseData.id}
                                          proofId={tx.proof_id}
                                          slot={slot}
                                          transactionId={tx.id}
                                          onUploaded={refresh}
                                        />
                                      </>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                            {tx.notes && <p className="text-sm text-gray-500">Notas: {tx.notes}</p>}
                            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                              <span>Metodo: {tx.method}</span>
                              <span>Direccion: {tx.direction}</span>
                              {tx.amount_ars != null && tx.amount_ars > 0 && <span>ARS: ${tx.amount_ars.toLocaleString()}</span>}
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
      )}

      {tab === 'evidencia' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">{evidence.length} archivos de evidencia</p>

          {evidence.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              <p className="text-gray-400">No hay evidencia cargada. Sube archivos desde la pestaña Transacciones.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {evidence.map(ev => {
                const tx = transactions.find(t => t.id === ev.transaction_id)
                const trans = transcriptionMap[ev.id]
                const isAudio = ev.file_type?.startsWith('audio/')
                const isImage = ev.file_type?.startsWith('image/')
                return (
                  <div key={ev.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-green-800 px-2.5 py-1 text-xs font-semibold text-white">
                        {tx?.proof_id ?? '—'}
                      </span>
                      <span className="text-xs">{evidenceStatusBadge(ev.status)}</span>
                    </div>
                    <p className="text-sm text-gray-500">{evidenceSlotLabel(ev.slot ?? "")}</p>
                    <p className="truncate text-sm text-gray-900">{ev.original_filename}</p>
                    {isImage && ev.file_url && (
                      <img src={ev.file_url} alt={ev.original_filename ?? ""} className="mt-2 rounded-lg max-h-40 object-cover w-full" />
                    )}
                    {isAudio && ev.file_url && (
                      <AudioPlayer src={ev.file_url} transcription={trans?.text} />
                    )}
                    {!isAudio && trans && (
                      <div className="mt-2 rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
                        <p className="font-medium text-gray-700 mb-1">Transcripcion:</p>
                        <p>{trans.text}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'partes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{parties.length} partes</p>
            <button onClick={() => { setEditingParty(null); setShowCreateParty(true) }}
              className="rounded-xl bg-green-800 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
              + Nueva Parte
            </button>
          </div>

          {(() => {
            const roleGroups: Record<string, Party[]> = {}
            for (const p of parties) {
              if (!roleGroups[p.role]) roleGroups[p.role] = []
              roleGroups[p.role].push(p)
            }
            const roleLabels: Record<string, string> = {
              acreedor: 'Acreedor', deudor: 'Deudor', intermediario: 'Intermediario',
              titular_cuenta: 'Titular de Cuenta', empleado: 'Empleado', familiar: 'Familiar', testigo: 'Testigo',
            }
            const roleBadge: Record<string, string> = {
              acreedor: 'bg-green-100 text-green-700', deudor: 'bg-red-100 text-red-700',
              intermediario: 'bg-blue-100 text-blue-700', titular_cuenta: 'bg-purple-100 text-purple-700',
              empleado: 'bg-yellow-100 text-yellow-700', familiar: 'bg-orange-100 text-orange-700',
              testigo: 'bg-gray-100 text-gray-600',
            }

            return Object.entries(roleGroups).map(([role, members]) => (
              <div key={role} className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">{roleLabels[role] ?? role}</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {members.map(p => {
                    const partyAccounts = bankAccounts.filter(a => a.party_id === p.id)
                    return (
                      <div key={p.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{p.name}</p>
                            <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadge[p.role] ?? 'bg-gray-100 text-gray-600'}`}>
                              {p.role}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => { setEditingParty(p); setShowCreateParty(true) }}
                              className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50">
                              Editar
                            </button>
                            <button onClick={() => setDeleteTarget({ type: 'party', id: p.id, label: p.name })}
                              className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50">
                              &times;
                            </button>
                          </div>
                        </div>
                        {(p.cuil_cuit || p.dni) && (
                          <div className="text-xs text-gray-500 space-y-0.5">
                            {p.cuil_cuit && <p>CUIL/CUIT: {p.cuil_cuit}</p>}
                            {p.dni && <p>DNI: {p.dni}</p>}
                          </div>
                        )}
                        {p.phone && <p className="text-xs text-gray-500">Tel: {p.phone}</p>}
                        {p.email && <p className="text-xs text-gray-500">Email: {p.email}</p>}
                        {partyAccounts.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500">Cuentas:</p>
                            {partyAccounts.map(a => (
                              <div key={a.id} className="rounded-xl bg-gray-50 p-2.5 text-xs">
                                <p className="font-medium text-gray-700">{a.bank}</p>
                                {a.alias && <p className="text-gray-500">Alias: {a.alias}</p>}
                                {a.cbu && <p className="text-gray-500">CBU: {a.cbu}</p>}
                              </div>
                            ))}
                          </div>
                        )}
                        {p.notes && <p className="text-xs text-gray-500">Notas: {p.notes}</p>}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          })()}
        </div>
      )}

      {tab === 'timeline' && (
        <div className="space-y-4">
          {(() => {
            type TimelineItem = { date: string; type: 'event' | 'transaction'; event?: TimelineEvent; transaction?: TransactionWithParties }
            const items: TimelineItem[] = [
              ...timelineEvents.map(e => ({ date: e.date, type: 'event' as const, event: e })),
              ...transactions.map(t => ({ date: t.date, type: 'transaction' as const, transaction: t })),
            ].sort((a, b) => a.date.localeCompare(b.date))

            const grouped: Record<string, TimelineItem[]> = {}
            for (const item of items) {
              const month = item.date.substring(0, 7)
              if (!grouped[month]) grouped[month] = []
              grouped[month].push(item)
            }

            const monthLabel = (ym: string) => {
              const [y, m] = ym.split('-')
              const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
              return `${months[parseInt(m) - 1]} ${y}`
            }

            return (
              <div className="relative space-y-8 pl-8 before:absolute before:left-3 before:top-0 before:h-full before:w-0.5 before:bg-gray-200">
                {Object.entries(grouped).map(([month, monthItems]) => (
                  <div key={month} className="space-y-4">
                    <h2 className="relative -ml-8 text-lg font-semibold text-gray-900">
                      <span className="absolute -left-0.5 top-1.5 h-3 w-3 rounded-full bg-green-800" />
                      <span className="ml-8">{monthLabel(month)}</span>
                    </h2>
                    {monthItems.map((item, i) => (
                      <div key={i} className="relative">
                        <span className="absolute -left-[1.375rem] top-2 h-2 w-2 rounded-full bg-gray-400" />
                        {item.type === 'transaction' && item.transaction ? (
                          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                              <span className="rounded-lg bg-green-800 px-2.5 py-1 text-xs font-semibold text-white">{item.transaction.proof_id}</span>
                              <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${typeColor(item.transaction.type)}`}>{item.transaction.type}</span>
                              <span className="text-xs text-gray-500">{formatDate(item.date)}</span>
                            </div>
                            <p className="mt-2 text-sm text-gray-700">{item.transaction.concept}</p>
                            <div className="mt-2 flex items-center gap-4 text-sm">
                              <span className="font-bold text-gray-900">{formatUSD(item.transaction.amount_usd)}</span>
                              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(item.transaction.status)}`}>
                                {statusBadge(item.transaction.status)} {item.transaction.status}
                              </span>
                            </div>
                          </div>
                        ) : item.event ? (
                          <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-green-800">{item.event.title}</span>
                              <span className="text-xs text-gray-500">{formatDate(item.date)}</span>
                            </div>
                            {item.event.description && <p className="mt-1 text-sm text-gray-600">{item.event.description}</p>}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      )}

      {tab === 'config' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900">Informacion del Caso</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Tipo:</span> <span className="font-medium text-gray-900">{caseData.case_type}</span></div>
              <div><span className="text-gray-500">Moneda:</span> <span className="font-medium text-gray-900">{caseData.currency}</span></div>
              <div><span className="text-gray-500">Fecha inicio:</span> <span className="font-medium text-gray-900">{formatDate(caseData.start_date)}</span></div>
              <div><span className="text-gray-500">Creado:</span> <span className="font-medium text-gray-900">{formatDate(caseData.created_at?.split('T')[0])}</span></div>
            </div>
            <button onClick={() => setShowEditCase(true)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Editar Caso
            </button>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900">Enlace Compartido</h3>
            <p className="text-sm text-gray-500">Genera un enlace de solo lectura para compartir con abogados.</p>
            {sharedLink ? (
              <div className="flex items-center gap-2">
                <input type="text" readOnly value={sharedLink}
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700" />
                <button onClick={() => navigator.clipboard.writeText(sharedLink)}
                  className="rounded-xl bg-green-800 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                  Copiar
                </button>
              </div>
            ) : (
              <button onClick={generateSharedLink} disabled={generatingLink}
                className="rounded-xl bg-green-800 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
                {generatingLink ? 'Generando...' : 'Generar Enlace'}
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-red-800">Zona de Peligro</h3>
            <p className="text-sm text-red-600">Eliminar este caso borrara todas las transacciones, evidencia y partes asociadas.</p>
            <button onClick={() => setDeleteTarget({ type: 'case', id: caseData.id, label: caseData.title })}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
              Eliminar Caso
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CaseForm open={showEditCase} onClose={() => setShowEditCase(false)} onSaved={refresh} editCase={caseData} />

      <TransactionForm
        open={showCreateTx}
        onClose={() => { setShowCreateTx(false); setEditingTx(null) }}
        onSaved={refresh}
        caseId={caseData.id}
        parties={parties}
        editTransaction={editingTx}
        nextProofId={nextProofId}
      />

      <PartyForm
        open={showCreateParty}
        onClose={() => { setShowCreateParty(false); setEditingParty(null) }}
        onSaved={refresh}
        caseId={caseData.id}
        editParty={editingParty}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Eliminar ${deleteTarget?.type === 'case' ? 'Caso' : deleteTarget?.type === 'transaction' ? 'Transaccion' : 'Parte'}`}
        message={`Seguro que quieres eliminar "${deleteTarget?.label}"? Esta accion no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
