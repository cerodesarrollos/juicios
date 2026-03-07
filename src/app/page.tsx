import { supabaseServer } from '@/lib/supabase-server'
import { CaseSummary, Transaction } from '@/lib/types'
import StatsBar from '@/components/StatsBar'
import { formatUSD, formatDate, statusBadge, typeColor } from '@/lib/utils'
import Link from 'next/link'

export const revalidate = 60

export default async function DashboardPage() {
  const { data: summaries } = await supabaseServer
    .from('case_summary')
    .select('*')

  const summary = (summaries?.[0] ?? null) as CaseSummary | null

  const { data: recentTx } = await supabaseServer
    .from('transactions')
    .select('*, from_party:parties!transactions_from_party_id_fkey(name), to_party:parties!transactions_to_party_id_fkey(name)')
    .order('sort_order', { ascending: false })
    .limit(8)

  const transactions = (recentTx ?? []) as (Transaction & { from_party: { name: string } | null; to_party: { name: string } | null })[]

  if (!summary) {
    return <div className="py-20 text-center text-text-muted">No hay casos cargados.</div>
  }

  const paidPct = Math.round((summary.total_paid_usd / summary.total_debt_usd) * 100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{summary.title}</h1>
        <p className="mt-1 text-sm text-text-muted">
          {summary.plaintiff_name} vs {summary.defendant_name} — Estado: <span className="text-accent">{summary.status}</span>
        </p>
      </div>

      <StatsBar summary={summary} />

      {/* Progress bar */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-text-muted">Progreso de cobro</span>
          <span className="font-medium text-accent">{paidPct}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${paidPct}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-text-muted">
          <span>Pagado: {formatUSD(summary.total_paid_usd)}</span>
          <span>Restante: {formatUSD(summary.pending_usd)}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <QuickAction href="/transactions" icon="💰" label="Ver Transacciones" count={summary.total_transactions} />
        <QuickAction href="/evidence" icon="📎" label="Ver Evidencia" count={summary.total_evidence} />
        <QuickAction href="/parties" icon="👥" label="Ver Partes" count={0} />
        <QuickAction href={`/case/${summary.slug}`} icon="📋" label="Detalle del Caso" />
      </div>

      {/* Recent Transactions */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-semibold">Transacciones Recientes</h2>
          <Link href="/transactions" className="text-sm text-accent hover:underline">Ver todas</Link>
        </div>
        <div className="divide-y divide-border">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center gap-4 p-4">
              <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${typeColor(tx.type)}`}>
                {tx.type}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{tx.proof_id} — {tx.concept}</p>
                <p className="text-xs text-text-muted">
                  {formatDate(tx.date)} · {tx.from_party?.name ?? '—'} → {tx.to_party?.name ?? '—'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{formatUSD(tx.amount_usd)}</p>
                <p className="text-xs">{statusBadge(tx.status)} {tx.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function QuickAction({ href, icon, label, count }: { href: string; icon: string; label: string; count?: number }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-accent/30 hover:bg-accent/5"
    >
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-sm font-medium">{label}</p>
        {count !== undefined && <p className="text-xs text-text-muted">{count} registros</p>}
      </div>
    </Link>
  )
}
