import { CaseSummary } from '@/lib/types'
import { formatUSD } from '@/lib/utils'

export default function StatsBar({ summary }: { summary: CaseSummary }) {
  const completionPct = summary.total_transactions > 0
    ? Math.round((summary.evidence_complete / (summary.total_transactions * 4)) * 100)
    : 0

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {/* First card: dark green gradient */}
      <div className="rounded-2xl bg-gradient-to-br from-green-800 to-green-900 p-5 text-white shadow-sm">
        <p className="text-sm font-medium text-green-200">Deuda Total</p>
        <p className="mt-1 text-4xl font-bold">{formatUSD(summary.total_debt_usd)}</p>
      </div>
      <StatCard label="Pagado" value={formatUSD(summary.total_paid_usd)} color="text-green-600" />
      <StatCard label="Pendiente" value={formatUSD(summary.pending_usd)} color="text-yellow-600" />
      <StatCard
        label="Evidencia"
        value={`${summary.evidence_complete}/${summary.total_transactions * 4}`}
        sub={`${completionPct}% completo`}
        color="text-blue-600"
      />
    </div>
  )
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-1 text-4xl font-bold ${color}`}>{value}</p>
      {sub && <p className="mt-0.5 text-sm text-gray-500">{sub}</p>}
    </div>
  )
}
