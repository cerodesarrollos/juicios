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
        ...form,
        case_id: caseId,
        proof_id: editTransaction?.proof_id ?? nextProofId ?? 'P-001',
        from_party_id: form.from_party_id || null,
        to_party_id: form.to_party_id || null,
        amount_usd: Number(form.amount_usd) || null,
        amount_ars: Number(form.amount_ars) || null,
      }

      if (editTransaction) {
        await fetch(`/api/transactions/${editTransaction.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }
      onSaved()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const types = ['pago', 'cuota', 'incumplimiento', 'servicio', 'informe', 'acuerdo', 'ajuste', 'devolucion', 'mercaderia']
  const methods = ['transferencia', 'efectivo', 'cheque', 'crypto', 'mercadopago', 'otro']
  const statuses = ['cumplido', 'incumplido', 'pendiente', 'parcial']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">
          {editTransaction ? `Editar ${editTransaction.proof_id}` : 'Nueva Transaccion'}
        </h3>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} required
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select value={form.type} onChange={e => set('type', e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm">
                {types.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">De</label>
              <select value={form.from_party_id} onChange={e => set('from_party_id', e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm">
                <option value="">— Seleccionar —</option>
                {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Para</label>
              <select value={form.to_party_id} onChange={e => set('to_party_id', e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm">
                <option value="">— Seleccionar —</option>
                {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto USD</label>
              <input type="number" step="0.01" value={form.amount_usd} onChange={e => set('amount_usd', e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto ARS</label>
              <input type="number" step="0.01" value={form.amount_ars} onChange={e => set('amount_ars', e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Metodo</label>
              <select value={form.method} onChange={e => set('method', e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm">
                {methods.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm">
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
            <input type="text" value={form.concept} onChange={e => set('concept', e.target.value)} required
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fase</label>
              <input type="text" value={form.phase_name} onChange={e => set('phase_name', e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Direccion</label>
              <select value={form.direction} onChange={e => set('direction', e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm">
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="rounded-xl bg-green-800 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
              {saving ? 'Guardando...' : editTransaction ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
