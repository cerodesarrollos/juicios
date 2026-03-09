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

// Shared card component
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[20px] p-px bg-gradient-to-b from-[#2a2a2e] to-[#1a1a1d] ${className}`}>
      <div className="rounded-[19px] bg-[#161619] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_32px_-8px_rgba(0,0,0,0.6)]">
        {children}
      </div>
    </div>
  )
}

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
    if (deleteTarget.type === 'case') router.push('/')
    else refresh()
  }

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
      if (txSearch) { const q = txSearch.toLowerCase(); if (!t.proof_id.toLowerCase().includes(q) && !t.concept.toLowerCase().includes(q) && !t.date.includes(q)) return false }
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
    id: caseData.id, slug: caseData.slug, title: caseData.title, status: caseData.status,
    plaintiff_name: caseData.plaintiff_name, defendant_name: caseData.defendant_name,
    total_debt_usd: caseData.total_debt_usd, total_paid_usd: paid, pending_usd: pending,
    total_transactions: transactions.length, total_evidence: evidence.length,
    evidence_complete: evidence.filter(e => e.status === 'adjuntado').length,
    evidence_pending: evidence.filter(e => e.status === 'pendiente').length,
    total_transcriptions: transcriptions.length,
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'resumen', label: 'Resumen' }, { key: 'transacciones', label: 'Transacciones' },
    { key: 'evidencia', label: 'Evidencia' }, { key: 'partes', label: 'Partes' },
    { key: 'timeline', label: 'Timeline' }, { key: 'config', label: 'Config' },
  ]

  async function generateSharedLink() {
    setGeneratingLink(true)
    try {
      const res = await fetch('/api/shared-links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ case_id: caseData.id }) })
      const data = await res.json()
      setSharedLink(`${window.location.origin}/shared/${data.token}`)
    } finally { setGeneratingLink(false) }
  }

  const btnPrimary = "inline-flex items-center px-5 py-2.5 rounded-[14px] bg-[#1e1e22] text-white/80 font-bold text-[13px] border border-white/[0.08] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),inset_0_-1px_0_rgba(255,255,255,0.04)] transition-all duration-150 hover:bg-[#222226]"
  const btnSecondary = "rounded-[12px] border border-white/[0.08] bg-[#1a1a1e] px-4 py-2 text-[13px] font-medium text-white/50 hover:bg-[#1e1e22]"
  const inputCls = "w-full rounded-[14px] border border-white/[0.08] bg-[#111114] px-3 py-2.5 text-[13px] text-white/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus:border-white/[0.15] focus:outline-none placeholder:text-white/15"
  const selectCls = "rounded-[14px] border border-white/[0.08] bg-[#111114] px-3 py-2.5 text-[13px] text-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[24px] font-medium text-white/90 tracking-tight">{caseData.title}</h1>
          <p className="mt-1 text-[13px] text-white/30">{caseData.plaintiff_name} vs {caseData.defendant_name}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full px-3.5 py-1 text-[11px] font-semibold bg-white/[0.07] text-white/55 border border-white/[0.08]">{caseData.status}</span>
          <PDFExport caseData={caseData} transactions={transactions} evidence={evidence} />
          <button onClick={() => setShowEditCase(true)} className={btnSecondary}>Editar</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-[16px] bg-white/[0.03] border border-white/[0.05] p-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`rounded-[12px] px-4 py-2 text-[13px] font-medium transition-all whitespace-nowrap ${
              tab === t.key ? 'bg-white/[0.07] text-white/85 border border-white/[0.08]' : 'text-white/30 hover:text-white/50 border border-transparent'
            }`}
          >{t.label}</button>
        ))}
      </div>

      {/* RESUMEN */}
      {tab === 'resumen' && (
        <div className="space-y-5">
          <StatsBar summary={caseSummary} />

          <Card>
            <div className="p-5">
              <div className="mb-3 flex items-center justify-between text-[13px]">
                <span className="text-white/30">Progreso de cobro</span>
                <span className="font-semibold text-white/70">{paidPct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-white/25 transition-all" style={{ width: `${paidPct}%` }} />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-white/20">
                <span>Pagado: {formatUSD(paid)}</span>
                <span>Restante: {formatUSD(pending)}</span>
              </div>
            </div>
          </Card>

          {caseData.description && (
            <Card>
              <div className="p-5">
                <h3 className="text-[14px] font-semibold text-white/70 mb-2">Descripcion</h3>
                <p className="text-[13px] text-white/40 leading-relaxed">{caseData.description}</p>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <div className="p-5 space-y-2">
                <h3 className="text-[13px] font-semibold text-white/55">Demandante</h3>
                <p className="text-[18px] font-medium text-white/85">{caseData.plaintiff_name}</p>
                <p className="text-[12px] text-white/25">CUIL: {caseData.plaintiff_cuil}</p>
              </div>
            </Card>
            <Card>
              <div className="p-5 space-y-2">
                <h3 className="text-[13px] font-semibold text-white/55">Demandado</h3>
                <p className="text-[18px] font-medium text-white/85">{caseData.defendant_name}</p>
                <p className="text-[12px] text-white/25">CUIL: {caseData.defendant_cuil}</p>
                {caseData.defendant_dni && <p className="text-[12px] text-white/25">DNI: {caseData.defendant_dni}</p>}
              </div>
            </Card>
          </div>

          <div className="space-y-3">
            <h2 className="text-[14px] font-normal text-white/40 pl-1">Actividad Reciente</h2>
            <Card><div className="px-6 py-1"><ActivityFeed logs={activityLog} /></div></Card>
          </div>
        </div>
      )}

      {/* TRANSACCIONES */}
      {tab === 'transacciones' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-[13px] text-white/30">{filteredTx.length} de {transactions.length} transacciones</p>
            <button onClick={() => { setEditingTx(null); setShowCreateTx(true) }} className={btnPrimary}>+ Nueva Transaccion</button>
          </div>

          <div className="flex flex-wrap gap-3">
            <input type="text" placeholder="Buscar..." value={txSearch} onChange={e => setTxSearch(e.target.value)} className={`flex-1 ${inputCls}`} />
            <select value={txFilterPhase} onChange={e => setTxFilterPhase(e.target.value)} className={selectCls}>
              <option value="">Todas las fases</option>{phases.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={txFilterType} onChange={e => setTxFilterType(e.target.value)} className={selectCls}>
              <option value="">Todos los tipos</option>{txTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={txFilterStatus} onChange={e => setTxFilterStatus(e.target.value)} className={selectCls}>
              <option value="">Todos los estados</option>{txStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {phases.filter(p => !txFilterPhase || p === txFilterPhase).map(phase => {
            const phaseItems = filteredTx.filter(t => t.phase_name === phase)
            if (phaseItems.length === 0) return null
            const phaseTotal = phaseItems.reduce((s, t) => s + (t.amount_usd ?? 0), 0)
            return (
              <div key={phase} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-[13px] font-semibold text-white/50">{phase}</h3>
                  <span className="text-[13px] font-bold text-white/60">{formatUSD(phaseTotal)}</span>
                </div>
                <Card>
                  <div className="divide-y divide-white/[0.05] overflow-hidden">
                    {phaseItems.map(tx => {
                      const txEvidence = evidenceByTx[tx.id] ?? []
                      const isExpanded = expandedTxId === tx.id
                      return (
                        <div key={tx.id}>
                          <button onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                            className="flex w-full items-center gap-4 p-4 text-left hover:bg-white/[0.02] transition-colors">
                            <span className="rounded-[10px] bg-white/[0.07] border border-white/[0.08] px-2.5 py-1 text-[11px] font-semibold text-white/60">{tx.proof_id}</span>
                            <span className="rounded-[8px] bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-[11px] font-medium text-white/40">{tx.type}</span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] text-white/70">{tx.concept}</p>
                              <p className="text-[11px] text-white/25">{formatDate(tx.date)} · {tx.from_party?.name ?? '—'} → {tx.to_party?.name ?? '—'}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[14px] font-bold text-white/80">{formatUSD(tx.amount_usd)}</p>
                              <span className="text-[11px] text-white/30">{tx.status}</span>
                            </div>
                            <span className="text-white/20">{isExpanded ? '▲' : '▼'}</span>
                          </button>

                          {isExpanded && (
                            <div className="border-t border-white/[0.05] bg-white/[0.02] p-4 space-y-3">
                              <div className="flex gap-2">
                                <button onClick={() => { setEditingTx(tx); setShowCreateTx(true) }} className={btnSecondary}>Editar</button>
                                <button onClick={() => setDeleteTarget({ type: 'transaction', id: tx.id, label: tx.proof_id })}
                                  className="rounded-[12px] border border-white/[0.08] bg-[#1a1a1e] px-3 py-1 text-[12px] font-medium text-white/40 hover:bg-[#1e1e22]">Eliminar</button>
                              </div>
                              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                {EVIDENCE_SLOTS.map(slot => {
                                  const ev = txEvidence.find(e => e.slot === slot)
                                  const trans = ev ? transcriptionMap[ev.id] : undefined
                                  const isAudio = ev?.file_type?.startsWith('audio/')
                                  return (
                                    <div key={slot} className="rounded-[14px] border border-white/[0.06] bg-[#111114] p-3 space-y-2">
                                      <p className="text-[11px] font-medium text-white/30">{evidenceSlotLabel(slot)}</p>
                                      {ev && ev.status === 'adjuntado' ? (
                                        <>
                                          <p className="text-[11px] text-white/50">{evidenceStatusBadge(ev.status)}</p>
                                          <p className="truncate text-[11px] text-white/20">{ev.original_filename}</p>
                                          {isAudio && ev.file_url && <AudioPlayer src={ev.file_url} transcription={trans?.text} />}
                                        </>
                                      ) : (
                                        <>
                                          <p className="text-[11px] text-white/20">Pendiente</p>
                                          <EvidenceUploader caseSlug={caseData.slug} caseId={caseData.id} proofId={tx.proof_id} slot={slot} transactionId={tx.id} onUploaded={refresh} />
                                        </>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                              {tx.notes && <p className="text-[13px] text-white/30">Notas: {tx.notes}</p>}
                              <div className="flex flex-wrap gap-4 text-[11px] text-white/20">
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
                </Card>
              </div>
            )
          })}
        </div>
      )}

      {/* EVIDENCIA */}
      {tab === 'evidencia' && (
        <div className="space-y-4">
          <p className="text-[13px] text-white/30">{evidence.length} archivos de evidencia</p>
          {evidence.length === 0 ? (
            <Card><div className="p-8 text-center"><p className="text-white/20">No hay evidencia cargada.</p></div></Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {evidence.map(ev => {
                const tx = transactions.find(t => t.id === ev.transaction_id)
                const trans = transcriptionMap[ev.id]
                const isAudio = ev.file_type?.startsWith('audio/')
                const isImage = ev.file_type?.startsWith('image/')
                return (
                  <Card key={ev.id}>
                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="rounded-[10px] bg-white/[0.07] border border-white/[0.08] px-2.5 py-1 text-[11px] font-semibold text-white/60">{tx?.proof_id ?? '—'}</span>
                        <span className="text-[11px] text-white/30">{evidenceStatusBadge(ev.status)}</span>
                      </div>
                      <p className="text-[12px] text-white/30">{evidenceSlotLabel(ev.slot ?? "")}</p>
                      <p className="truncate text-[13px] text-white/70">{ev.original_filename}</p>
                      {isImage && ev.file_url && <img src={ev.file_url} alt={ev.original_filename ?? ""} className="mt-2 rounded-[12px] max-h-40 object-cover w-full opacity-90" />}
                      {isAudio && ev.file_url && <AudioPlayer src={ev.file_url} transcription={trans?.text} />}
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* PARTES */}
      {tab === 'partes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-white/30">{parties.length} partes</p>
            <button onClick={() => { setEditingParty(null); setShowCreateParty(true) }} className={btnPrimary}>+ Nueva Parte</button>
          </div>
          {(() => {
            const roleGroups: Record<string, Party[]> = {}
            for (const p of parties) { if (!roleGroups[p.role]) roleGroups[p.role] = []; roleGroups[p.role].push(p) }
            return Object.entries(roleGroups).map(([role, members]) => (
              <div key={role} className="space-y-3">
                <h2 className="text-[16px] font-medium text-white/60">{role}</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {members.map(p => {
                    const partyAccounts = bankAccounts.filter(a => a.party_id === p.id)
                    return (
                      <Card key={p.id}>
                        <div className="p-5 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-white/80">{p.name}</p>
                              <span className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-white/[0.05] text-white/35 border border-white/[0.06]">{p.role}</span>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => { setEditingParty(p); setShowCreateParty(true) }} className="rounded-[10px] border border-white/[0.08] px-2 py-1 text-[11px] text-white/40 hover:bg-white/[0.04]">Editar</button>
                              <button onClick={() => setDeleteTarget({ type: 'party', id: p.id, label: p.name })} className="rounded-[10px] border border-white/[0.08] px-2 py-1 text-[11px] text-white/30 hover:bg-white/[0.04]">×</button>
                            </div>
                          </div>
                          {(p.cuil_cuit || p.dni) && <div className="text-[11px] text-white/25 space-y-0.5">{p.cuil_cuit && <p>CUIL/CUIT: {p.cuil_cuit}</p>}{p.dni && <p>DNI: {p.dni}</p>}</div>}
                          {p.phone && <p className="text-[11px] text-white/25">Tel: {p.phone}</p>}
                          {p.email && <p className="text-[11px] text-white/25">Email: {p.email}</p>}
                          {partyAccounts.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-[11px] font-medium text-white/30">Cuentas:</p>
                              {partyAccounts.map(a => (
                                <div key={a.id} className="rounded-[12px] bg-white/[0.03] border border-white/[0.05] p-2.5 text-[11px]">
                                  <p className="font-medium text-white/50">{a.bank}</p>
                                  {a.alias && <p className="text-white/25">Alias: {a.alias}</p>}
                                  {a.cbu && <p className="text-white/25">CBU: {a.cbu}</p>}
                                </div>
                              ))}
                            </div>
                          )}
                          {p.notes && <p className="text-[11px] text-white/25">Notas: {p.notes}</p>}
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))
          })()}
        </div>
      )}

      {/* TIMELINE */}
      {tab === 'timeline' && (
        <div className="space-y-4">
          {(() => {
            type TimelineItem = { date: string; type: 'event' | 'transaction'; event?: TimelineEvent; transaction?: TransactionWithParties }
            const items: TimelineItem[] = [
              ...timelineEvents.map(e => ({ date: e.date, type: 'event' as const, event: e })),
              ...transactions.map(t => ({ date: t.date, type: 'transaction' as const, transaction: t })),
            ].sort((a, b) => a.date.localeCompare(b.date))

            const grouped: Record<string, TimelineItem[]> = {}
            for (const item of items) { const month = item.date.substring(0, 7); if (!grouped[month]) grouped[month] = []; grouped[month].push(item) }

            const monthLabel = (ym: string) => {
              const [y, m] = ym.split('-')
              const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
              return `${months[parseInt(m) - 1]} ${y}`
            }

            return (
              <div className="relative space-y-8 pl-8 before:absolute before:left-3 before:top-0 before:h-full before:w-0.5 before:bg-white/[0.06]">
                {Object.entries(grouped).map(([month, monthItems]) => (
                  <div key={month} className="space-y-4">
                    <h2 className="relative -ml-8 text-[16px] font-medium text-white/60">
                      <span className="absolute -left-0.5 top-1.5 h-3 w-3 rounded-full bg-white/20" />
                      <span className="ml-8">{monthLabel(month)}</span>
                    </h2>
                    {monthItems.map((item, i) => (
                      <div key={i} className="relative">
                        <span className="absolute -left-[1.375rem] top-2 h-2 w-2 rounded-full bg-white/15" />
                        {item.type === 'transaction' && item.transaction ? (
                          <Card>
                            <div className="p-4">
                              <div className="flex items-center gap-3">
                                <span className="rounded-[10px] bg-white/[0.07] border border-white/[0.08] px-2.5 py-1 text-[11px] font-semibold text-white/60">{item.transaction.proof_id}</span>
                                <span className="rounded-[8px] bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/35">{item.transaction.type}</span>
                                <span className="text-[11px] text-white/20">{formatDate(item.date)}</span>
                              </div>
                              <p className="mt-2 text-[13px] text-white/55">{item.transaction.concept}</p>
                              <div className="mt-2 flex items-center gap-4">
                                <span className="text-[14px] font-bold text-white/80">{formatUSD(item.transaction.amount_usd)}</span>
                                <span className="text-[11px] text-white/30">{item.transaction.status}</span>
                              </div>
                            </div>
                          </Card>
                        ) : item.event ? (
                          <Card>
                            <div className="p-4">
                              <div className="flex items-center gap-3">
                                <span className="text-[13px] font-semibold text-white/70">{item.event.title}</span>
                                <span className="text-[11px] text-white/20">{formatDate(item.date)}</span>
                              </div>
                              {item.event.description && <p className="mt-1 text-[13px] text-white/35">{item.event.description}</p>}
                            </div>
                          </Card>
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

      {/* CONFIG */}
      {tab === 'config' && (
        <div className="space-y-5">
          <Card>
            <div className="p-5 space-y-4">
              <h3 className="text-[14px] font-semibold text-white/70">Informacion del Caso</h3>
              <div className="grid grid-cols-2 gap-4 text-[13px]">
                <div><span className="text-white/25">Tipo:</span> <span className="font-medium text-white/60">{caseData.case_type}</span></div>
                <div><span className="text-white/25">Moneda:</span> <span className="font-medium text-white/60">{caseData.currency}</span></div>
                <div><span className="text-white/25">Fecha inicio:</span> <span className="font-medium text-white/60">{formatDate(caseData.start_date)}</span></div>
                <div><span className="text-white/25">Creado:</span> <span className="font-medium text-white/60">{formatDate(caseData.created_at?.split('T')[0])}</span></div>
              </div>
              <button onClick={() => setShowEditCase(true)} className={btnSecondary}>Editar Caso</button>
            </div>
          </Card>

          <Card>
            <div className="p-5 space-y-4">
              <h3 className="text-[14px] font-semibold text-white/70">Enlace Compartido</h3>
              <p className="text-[13px] text-white/30">Genera un enlace de solo lectura para compartir con abogados.</p>
              {sharedLink ? (
                <div className="flex items-center gap-2">
                  <input type="text" readOnly value={sharedLink} className={inputCls} />
                  <button onClick={() => navigator.clipboard.writeText(sharedLink)} className={btnPrimary}>Copiar</button>
                </div>
              ) : (
                <button onClick={generateSharedLink} disabled={generatingLink} className={`${btnPrimary} disabled:opacity-50`}>
                  {generatingLink ? 'Generando...' : 'Generar Enlace'}
                </button>
              )}
            </div>
          </Card>

          <Card>
            <div className="p-5 space-y-4">
              <h3 className="text-[14px] font-semibold text-white/55">Zona de Peligro</h3>
              <p className="text-[13px] text-white/30">Eliminar este caso borrara todas las transacciones, evidencia y partes asociadas.</p>
              <button onClick={() => setDeleteTarget({ type: 'case', id: caseData.id, label: caseData.title })}
                className="rounded-[12px] border border-white/[0.08] bg-[#1e1e22] px-4 py-2 text-[13px] font-semibold text-white/60 hover:bg-[#222226]">
                Eliminar Caso
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Modals */}
      <CaseForm open={showEditCase} onClose={() => setShowEditCase(false)} onSaved={refresh} editCase={caseData} />
      <TransactionForm open={showCreateTx} onClose={() => { setShowCreateTx(false); setEditingTx(null) }} onSaved={refresh} caseId={caseData.id} parties={parties} editTransaction={editingTx} nextProofId={nextProofId} />
      <PartyForm open={showCreateParty} onClose={() => { setShowCreateParty(false); setEditingParty(null) }} onSaved={refresh} caseId={caseData.id} editParty={editingParty} />
      <ConfirmDialog open={!!deleteTarget} title={`Eliminar ${deleteTarget?.type === 'case' ? 'Caso' : deleteTarget?.type === 'transaction' ? 'Transaccion' : 'Parte'}`} message={`Seguro que quieres eliminar "${deleteTarget?.label}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}
