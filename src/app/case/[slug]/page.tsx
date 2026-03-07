import { supabaseServer } from '@/lib/supabase-server'
import { Case, Transaction, Party, Evidence } from '@/lib/types'
import { formatUSD, formatDate, statusBadge, typeColor, evidenceSlotLabel, evidenceStatusBadge } from '@/lib/utils'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 60

const EVIDENCE_SLOTS = ['comprobante', 'captura', 'audio', 'transcripcion']

export default async function CaseDetailPage({ params }: { params: { slug: string } }) {
  const { data: cases } = await supabaseServer
    .from('cases')
    .select('*')
    .eq('slug', params.slug)
    .limit(1)

  const caseData = cases?.[0] as Case | undefined
  if (!caseData) notFound()

  const [
    { data: parties },
    { data: transactions },
    { data: evidence },
  ] = await Promise.all([
    supabaseServer.from('parties').select('*').eq('case_id', caseData.id).order('role'),
    supabaseServer.from('transactions')
      .select('*, from_party:parties!transactions_from_party_id_fkey(name), to_party:parties!transactions_to_party_id_fkey(name)')
      .eq('case_id', caseData.id)
      .order('sort_order'),
    supabaseServer.from('evidence').select('*').eq('case_id', caseData.id),
  ])

  const partyList = (parties ?? []) as Party[]
  const txList = (transactions ?? []) as (Transaction & { from_party: { name: string } | null; to_party: { name: string } | null })[]
  const evidenceList = (evidence ?? []) as Evidence[]

  const paidPct = caseData.total_debt_usd > 0
    ? Math.round((caseData.total_paid_usd / caseData.total_debt_usd) * 100)
    : 0
  const pending = caseData.total_debt_usd - caseData.total_paid_usd

  // Group tx by phase
  const phases: Record<string, typeof txList> = {}
  for (const tx of txList) {
    if (!phases[tx.phase_name]) phases[tx.phase_name] = []
    phases[tx.phase_name].push(tx)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/" className="text-sm text-accent hover:underline">← Volver</Link>
          <h1 className="mt-2 text-2xl font-bold">{caseData.title}</h1>
          <p className="mt-1 text-sm text-text-muted">{caseData.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-accent/20 px-3 py-1 text-sm font-medium text-accent">{caseData.status}</span>
          <span className="text-sm text-text-muted">{caseData.case_type}</span>
        </div>
      </div>

      {/* Case Info */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <h3 className="font-semibold text-accent">Demandante</h3>
          <p className="text-lg font-bold">{caseData.plaintiff_name}</p>
          <p className="text-sm text-text-muted">CUIL: {caseData.plaintiff_cuil}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <h3 className="font-semibold text-danger">Demandado</h3>
          <p className="text-lg font-bold">{caseData.defendant_name}</p>
          <p className="text-sm text-text-muted">CUIL: {caseData.defendant_cuil}</p>
          {caseData.defendant_dni && <p className="text-sm text-text-muted">DNI: {caseData.defendant_dni}</p>}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <h3 className="font-semibold">Resumen Financiero</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-danger">{formatUSD(caseData.total_debt_usd)}</p>
            <p className="text-xs text-text-muted">Deuda Total</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent">{formatUSD(caseData.total_paid_usd)}</p>
            <p className="text-xs text-text-muted">Pagado</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-warning">{formatUSD(pending)}</p>
            <p className="text-xs text-text-muted">Pendiente</p>
          </div>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-border">
          <div className="h-full rounded-full bg-accent" style={{ width: `${paidPct}%` }} />
        </div>
        <p className="text-center text-sm text-text-muted">{paidPct}% cobrado — Desde: {formatDate(caseData.start_date)}</p>
      </div>

      {/* Parties */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h3 className="font-semibold">Partes ({partyList.length})</h3>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          {partyList.map(p => (
            <div key={p.id} className="rounded-lg bg-bg p-3 text-sm">
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-text-muted capitalize">{p.role}</p>
              {p.phone && <p className="text-xs text-text-muted">📱 {p.phone}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Transactions by Phase */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Transacciones por Fase</h3>
        {Object.entries(phases).map(([phase, phaseTxs]) => {
          const phaseTotal = phaseTxs.reduce((s, t) => s + (t.amount_usd ?? 0), 0)
          return (
            <div key={phase} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border bg-accent/5 p-4">
                <h4 className="text-sm font-semibold text-accent">{phase}</h4>
                <span className="text-sm font-bold">{formatUSD(phaseTotal)}</span>
              </div>
              <div className="divide-y divide-border">
                {phaseTxs.map(tx => {
                  const txEvidence = evidenceList.filter(e => e.transaction_id === tx.id)
                  return (
                    <div key={tx.id} className="p-4 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-accent">{tx.proof_id}</span>
                        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${typeColor(tx.type)}`}>{tx.type}</span>
                        <span className="text-xs text-text-muted">{formatDate(tx.date)}</span>
                        <span className="ml-auto text-sm font-bold">{formatUSD(tx.amount_usd)}</span>
                        <span className="text-xs">{statusBadge(tx.status)}</span>
                      </div>
                      <p className="text-sm text-text-muted">{tx.concept}</p>
                      <p className="text-xs text-text-muted">
                        {tx.from_party?.name ?? '—'} → {tx.to_party?.name ?? '—'} · {tx.method}
                      </p>
                      {/* Evidence slots */}
                      <div className="flex gap-2">
                        {EVIDENCE_SLOTS.map(slot => {
                          const ev = txEvidence.find(e => e.slot === slot)
                          return (
                            <span key={slot} className="rounded bg-bg px-2 py-1 text-xs text-text-muted">
                              {evidenceSlotLabel(slot)}: {ev ? evidenceStatusBadge(ev.status) : '⏳ Pendiente'}
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
    </div>
  )
}
