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

  const statusColors: Record<string, string> = {
    activo: 'bg-green-100 text-green-700',
    cerrado: 'bg-gray-100 text-gray-600',
    archivado: 'bg-yellow-100 text-yellow-700',
    ganado: 'bg-blue-100 text-blue-700',
    perdido: 'bg-red-100 text-red-700',
  }

  return (
    <Link
      href={`/case/${summary.slug}`}
      className="block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-green-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <h3 className="text-base font-semibold text-gray-900 truncate">{summary.title}</h3>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[summary.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {summary.status}
        </span>
      </div>

      <p className="mt-1 text-sm text-gray-500">
        {summary.plaintiff_name} vs {summary.defendant_name}
      </p>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Deuda total</span>
          <span className="font-bold text-gray-900">{formatUSD(summary.total_debt_usd)}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full rounded-full bg-green-600 transition-all" style={{ width: `${paidPct}%` }} />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>{paidPct}% cobrado</span>
          <span>{formatUSD(summary.pending_usd)} pendiente</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>{summary.total_transactions} transacciones</span>
        <span>Evidencia: {evidencePct}%</span>
      </div>
    </Link>
  )
}
