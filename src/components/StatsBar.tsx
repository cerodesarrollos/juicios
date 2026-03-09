import { CaseSummary } from '@/lib/types'
import { formatUSD } from '@/lib/utils'
import { CurrencyDollar, FolderOpen } from '@phosphor-icons/react'

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[20px] p-px bg-gradient-to-b from-[#2a2a2e] to-[#1a1a1d]">
      <div className="rounded-[19px] bg-[#161619] shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_32px_-8px_rgba(0,0,0,0.6)]">
        {children}
      </div>
    </div>
  )
}

export default function StatsBar({ summary }: { summary: CaseSummary }) {
  const completionPct = summary.total_transactions > 0
    ? Math.round((summary.evidence_complete / (summary.total_transactions * 4)) * 100)
    : 0

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Card>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-normal text-white/25 uppercase tracking-[0.14em]">Deuda Total</span>
            <CurrencyDollar size={18} weight="thin" className="text-white/15" />
          </div>
          <p className="text-[28px] font-medium text-white/90 leading-none tracking-tight">{formatUSD(summary.total_debt_usd)}</p>
        </div>
      </Card>
      <Card>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-normal text-white/25 uppercase tracking-[0.14em]">Pagado</span>
            <CurrencyDollar size={18} weight="thin" className="text-white/15" />
          </div>
          <p className="text-[28px] font-medium text-white/90 leading-none tracking-tight">{formatUSD(summary.total_paid_usd)}</p>
        </div>
      </Card>
      <Card>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-normal text-white/25 uppercase tracking-[0.14em]">Pendiente</span>
            <CurrencyDollar size={18} weight="thin" className="text-white/15" />
          </div>
          <p className="text-[28px] font-medium text-white/90 leading-none tracking-tight">{formatUSD(summary.pending_usd)}</p>
        </div>
      </Card>
      <Card>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-normal text-white/25 uppercase tracking-[0.14em]">Evidencia</span>
            <FolderOpen size={18} weight="thin" className="text-white/15" />
          </div>
          <p className="text-[28px] font-medium text-white/90 leading-none tracking-tight">{summary.evidence_complete}/{summary.total_transactions * 4}</p>
          <p className="mt-1 text-[12px] text-white/25">{completionPct}% completo</p>
        </div>
      </Card>
    </div>
  )
}
