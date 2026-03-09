'use client'

import Link from 'next/link'
import { CaseSummary } from '@/lib/types'
import { formatUSD } from '@/lib/utils'

export default function CaseCard({ summary }: { summary: CaseSummary }) {
  const paidPct = summary.total_debt_usd > 0
    ? Math.round((summary.total_paid_usd / summary.total_debt_usd) * 100)
    : 0

  const evidencePct = summary.total_transactions > 0
    ? Math.round((summary.evidence_complete / (summary.total_transactions * 4)) * 100)
    : 0

  return (
    <Link
      href={`/case/${summary.slug}`}
      className="block rounded-[20px] p-px bg-gradient-to-b from-[#2a2a2e] to-[#1a1a1d] transition-all hover:from-[#333338] hover:to-[#222225]"
    >
      <div className="rounded-[19px] bg-[#161619] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_32px_-8px_rgba(0,0,0,0.6)]">
        <div className="flex items-start justify-between">
          <h3 className="text-[14px] font-semibold text-white/85 truncate">{summary.title}</h3>
          <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-white/[0.07] text-white/55 border border-white/[0.08]">
            {summary.status}
          </span>
        </div>

        <p className="mt-1.5 text-[13px] text-white/30">
          {summary.plaintiff_name} vs {summary.defendant_name}
        </p>

        <div className="mt-5 space-y-3">
          <div className="flex justify-between text-[13px]">
            <span className="text-white/25">Deuda total</span>
            <span className="font-semibold text-white/80">{formatUSD(summary.total_debt_usd)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-white/20 transition-all" style={{ width: `${paidPct}%` }} />
          </div>
          <div className="flex justify-between text-[11px] text-white/20">
            <span>{paidPct}% cobrado</span>
            <span>{formatUSD(summary.pending_usd)} pendiente</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-[11px] text-white/20">
          <span>{summary.total_transactions} transacciones</span>
          <span>Evidencia: {evidencePct}%</span>
        </div>
      </div>
    </Link>
  )
}
