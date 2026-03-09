'use client'

import { useState } from 'react'
import { Transaction, Party } from '@/lib/types'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  caseId: string
  parties: Party[]
  editTransaction?: Transaction | null
  nextProofId?: string
}

const inputCls = "w-full rounded-[14px] border border-white/[0.08] bg-[#111114] px-3 py-2 text-[13px] text-white/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus:border-white/[0.15] focus:outline-none"
const labelCls = "block text-[12px] font-medium text-white/40 mb-1"
const selectCls = "w-full rounded-[14px] border border-white/[0.08] bg-[#111114] px-3 py-2 text-[13px] text-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"

export default function TransactionForm({ open, onClose, onSaved, caseId, parties, editTransaction, nextProofId }: Props) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    date: editTransaction?.date ?? new Date().toISOString().split('T')[0],
    type: editTransaction?.type ?? 'pago',
    from_party_id: editTransaction?.from_party_id ?? '',
    to_party_id: editTransaction?.to_party_id ?? '',
    amount_usd: editTransaction?.amount_usd ?? 0,
    amount_ars: editTransaction?.amount_ars ?? 0,
    method: editTransaction?.method ?? 'transferencia',
    concept: editTransaction?.concept ?? '',
    status: editTransaction?.status ?? 'pendiente',
    phase: editTransaction?.phase ?? 1,
    phase_name: editTransaction?.phase_name ?? 'Fase 1',
    direction: editTransaction?.direction ?? 'entrada',
    notes: editTransaction?.notes ?? '',
  })

  if (!open) return null

  function set(field: string, value: string | number) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const body = {
        ...form, case_id: caseId, proof_id: editTransaction?.proof_id ?? nextProofId ?? 'P-001',
        from_party_id: form.from_party_id || null, to_party_id: form.to_party_id || null,
        amount_usd: Number(form.amount_usd) || null, amount_ars: Number(form.amount_ars) || null,
      }
      if (editTransaction) {
        await fetch(`/api/transactions/${editTransaction.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      } else {
        await fetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      }
      onSaved(); onClose()
    } finally { setSaving(false) }
  }

  const types = ['pago', 'cuota', 'incumplimiento', 'servicio', 'informe', 'acuerdo', 'ajuste', 'devolucion', 'mercaderia']
  const methods = ['transferencia', 'efectivo', 'cheque', 'crypto', 'mercadopago', 'otro']
  const statuses = ['cumplido', 'incumplido', 'pendiente', 'parcial']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[20px] p-px bg-gradient-to-b from-[#2a2a2e] to-[#1a1a1d]">
        <div className="rounded-[19px] bg-[#161619] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_32px_-8px_rgba(0,0,0,0.6)]">
          <h3 className="text-[16px] font-semibold text-white/85">
            {editTransaction ? `Editar ${editTransaction.proof_id}` : 'Nueva Transaccion'}
          </h3>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>Fecha</label><input type="date" value={form.date} onChange={e => set('date', e.target.value)} required className={inputCls} /></div>
              <div><label className={labelCls}>Tipo</label><select value={form.type} onChange={e => set('type', e.target.value)} className={selectCls}>{types.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>De</label><select value={form.from_party_id} onChange={e => set('from_party_id', e.target.value)} className={selectCls}><option value="">— Seleccionar —</option>{parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
              <div><label className={labelCls}>Para</label><select value={form.to_party_id} onChange={e => set('to_party_id', e.target.value)} className={selectCls}><option value="">— Seleccionar —</option>{parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>Monto USD</label><input type="number" step="0.01" value={form.amount_usd} onChange={e => set('amount_usd', e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Monto ARS</label><input type="number" step="0.01" value={form.amount_ars} onChange={e => set('amount_ars', e.target.value)} className={inputCls} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>Metodo</label><select value={form.method} onChange={e => set('method', e.target.value)} className={selectCls}>{methods.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
              <div><label className={labelCls}>Estado</label><select value={form.status} onChange={e => set('status', e.target.value)} className={selectCls}>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            </div>
            <div><label className={labelCls}>Concepto</label><input type="text" value={form.concept} onChange={e => set('concept', e.target.value)} required className={inputCls} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>Fase</label><input type="text" value={form.phase_name} onChange={e => set('phase_name', e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Direccion</label><select value={form.direction} onChange={e => set('direction', e.target.value)} className={selectCls}><option value="entrada">Entrada</option><option value="salida">Salida</option></select></div>
            </div>
            <div><label className={labelCls}>Notas</label><textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className={inputCls} /></div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="rounded-[12px] border border-white/[0.08] bg-[#1a1a1e] px-4 py-2 text-[13px] font-medium text-white/50 hover:bg-[#1e1e22]">Cancelar</button>
              <button type="submit" disabled={saving} className="rounded-[12px] bg-[#1e1e22] px-4 py-2 text-[13px] font-bold text-white/80 border border-white/[0.08] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] hover:bg-[#222226] disabled:opacity-50">
                {saving ? 'Guardando...' : editTransaction ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
