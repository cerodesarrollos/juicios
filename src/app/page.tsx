import { supabaseServer } from '@/lib/supabase-server'
import { CaseSummary, Transaction } from '@/lib/types'
import StatsBar from '@/components/StatsBar'
import { formatUSD, formatDate, statusBadge, typeColor, statusBadgeClass } from '@/lib/utils'
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
    return <div className="py-20 text-center text-gray-500">No hay casos cargados.</div>
  }

  const paidPct = Math.round((summary.total_paid_usd / summary.total_debt_usd) * 100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{summary.title}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {summary.plaintiff_name} vs {summary.defendant_name} — Estado: <span className="font-medium text-green-800">{summary.status}</span>
        </p>
      </div>

      <StatsBar summary={summary} />

      {/* Progress bar */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-gray-500">Progreso de cobro</span>
          <span className="font-semibold text-green-800">{paidPct}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-green-600 transition-all"
            style={{ width: `${paidPct}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>Pagado: {formatUSD(summary.total_paid_usd)}</span>
          <span>Restante: {formatUSD(summary.pending_usd)}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <QuickAction href="/transactions" icon="💰" label="Ver Transacciones" count={summary.total_transactions} />
        <QuickAction href="/evidence" icon="📎" label="Ver Evidencia" count={summary.total_evidence} />
        <QuickAction href="/parties" icon="👥" label="Ver Partes" count={0} />
        <QuickAction href={`/case/${summary.slug}`} icon="📋" label="Detalle del Caso" />
      </div>

      {/* Recent Transactions */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900">Transacciones Recientes</h2>
          <Link href="/transactions" className="text-sm font-medium text-green-800 hover:underline">Ver todas</Link>
        </div>
        <div className="divide-y divide-gray-100">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
              <span className="rounded-lg bg-green-800 px-2.5 py-1 text-xs font-semibold text-white">
                {tx.proof_id}
              </span>
              <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${typeColor(tx.type)}`}>
                {tx.type}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{tx.concept}</p>
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
      className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-green-300 hover:shadow-md"
    >
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {count !== undefined && <p className="text-xs text-gray-500">{count} registros</p>}
      </div>
    </Link>
  )
}
