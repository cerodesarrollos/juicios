import { CaseSummary } from '@/lib/types'
import { formatUSD } from '@/lib/utils'

export default function StatsBar({ summary }: { summary: CaseSummary }) {
  const completionPct = summary.total_transactions > 0
    ? Math.round((summary.evidence_complete / (summary.total_transactions * 4)) * 100)
    : 0

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard label="Deuda Total" value={formatUSD(summary.total_debt_usd)} color="text-danger" />
      <StatCard label="Pagado" value={formatUSD(summary.total_paid_usd)} color="text-accent" />
      <StatCard label="Pendiente" value={formatUSD(summary.pending_usd)} color="text-warning" />
      <StatCard
        label="Evidencia"
        value={`${summary.evidence_complete}/${summary.total_transactions * 4}`}
        sub={`${completionPct}% completo`}
        color="text-info"
      />
    </div>
  )
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-text-muted">{label}</p>
      <p className={`mt-1 text-xl font-bold ${color}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-text-muted">{sub}</p>}
    </div>
  )
}
