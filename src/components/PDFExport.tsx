'use client'

import { Case, TransactionWithParties, Evidence } from '@/lib/types'
import { formatUSD, formatDate, evidenceSlotLabel } from '@/lib/utils'

interface Props {
  caseData: Case
  transactions: TransactionWithParties[]
  evidence: Evidence[]
}

export default function PDFExport({ caseData, transactions, evidence }: Props) {
  function handleExport() {
    const evidenceByTx: Record<string, Evidence[]> = {}
    for (const e of evidence) {
      if (e.transaction_id) {
        if (!evidenceByTx[e.transaction_id]) evidenceByTx[e.transaction_id] = []
        evidenceByTx[e.transaction_id].push(e)
      }
    }

    const slots = ['comprobante', 'captura', 'audio', 'transcripcion']
    const paid = caseData.total_paid_usd
    const pending = caseData.total_debt_usd - paid
    const pct = caseData.total_debt_usd > 0 ? Math.round((paid / caseData.total_debt_usd) * 100) : 0

    let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Indice de Pruebas - ${caseData.title}</title>
    <style>
      body { font-family: 'Inter', Arial, sans-serif; margin: 40px; color: #111; font-size: 13px; }
      h1 { font-size: 20px; margin-bottom: 4px; }
      h2 { font-size: 16px; margin-top: 24px; border-bottom: 2px solid #166534; padding-bottom: 4px; color: #166534; }
      .header-info { color: #666; font-size: 12px; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
      th { background: #f3f4f6; text-align: left; padding: 6px 8px; border: 1px solid #e5e7eb; font-weight: 600; }
      td { padding: 6px 8px; border: 1px solid #e5e7eb; vertical-align: top; }
      .summary-grid { display: flex; gap: 24px; margin: 16px 0; }
      .summary-item { text-align: center; }
      .summary-value { font-size: 18px; font-weight: 700; }
      .summary-label { font-size: 11px; color: #666; }
      .evidence-status { font-size: 11px; }
      .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #e5e7eb; padding-top: 10px; }
      @media print { body { margin: 20px; } }
    </style></head><body>`

    html += `<h1>${caseData.title}</h1>`
    html += `<div class="header-info">${caseData.plaintiff_name} vs ${caseData.defendant_name} | Tipo: ${caseData.case_type} | Estado: ${caseData.status} | Inicio: ${formatDate(caseData.start_date)}</div>`

    html += `<div class="summary-grid">
      <div class="summary-item"><div class="summary-value" style="color:#ef4444">${formatUSD(caseData.total_debt_usd)}</div><div class="summary-label">Deuda Total</div></div>
      <div class="summary-item"><div class="summary-value" style="color:#22c55e">${formatUSD(paid)}</div><div class="summary-label">Pagado</div></div>
      <div class="summary-item"><div class="summary-value" style="color:#eab308">${formatUSD(pending)}</div><div class="summary-label">Pendiente</div></div>
      <div class="summary-item"><div class="summary-value">${pct}%</div><div class="summary-label">Cobrado</div></div>
    </div>`

    html += `<h2>Indice de Pruebas (${transactions.length} transacciones)</h2>`
    html += `<table><thead><tr><th>#</th><th>Prueba</th><th>Fecha</th><th>Tipo</th><th>Concepto</th><th>Monto</th><th>Estado</th>`
    slots.forEach(s => { html += `<th>${evidenceSlotLabel(s)}</th>` })
    html += `</tr></thead><tbody>`

    transactions.forEach((tx, i) => {
      const txEv = evidenceByTx[tx.id] ?? []
      html += `<tr><td>${i + 1}</td><td><strong>${tx.proof_id}</strong></td><td>${formatDate(tx.date)}</td><td>${tx.type}</td><td>${tx.concept}</td><td>${formatUSD(tx.amount_usd)}</td><td>${tx.status}</td>`
      slots.forEach(s => {
        const ev = txEv.find(e => e.slot === s)
        html += `<td class="evidence-status">${ev ? (ev.status === 'adjuntado' ? 'OK' : ev.status) : 'pendiente'}</td>`
      })
      html += `</tr>`
    })

    html += `</tbody></table>`
    html += `<div class="footer">Generado el ${new Date().toLocaleDateString('es-AR')} — Juicios v2.0</div>`
    html += `</body></html>`

    const w = window.open('', '_blank')
    if (w) {
      w.document.write(html)
      w.document.close()
      setTimeout(() => w.print(), 500)
    }
  }

  return (
    <button
      onClick={handleExport}
      className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
    >
      Exportar PDF
    </button>
  )
}
