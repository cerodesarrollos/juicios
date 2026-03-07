'use client'

import { useState } from 'react'
import { Case } from '@/lib/types'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  editCase?: Case | null
}

export default function CaseForm({ open, onClose, onSaved, editCase }: Props) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: editCase?.title ?? '',
    description: editCase?.description ?? '',
    plaintiff_name: editCase?.plaintiff_name ?? '',
    plaintiff_cuil: editCase?.plaintiff_cuil ?? '',
    defendant_name: editCase?.defendant_name ?? '',
    defendant_cuil: editCase?.defendant_cuil ?? '',
    defendant_dni: editCase?.defendant_dni ?? '',
    total_debt_usd: editCase?.total_debt_usd ?? 0,
    case_type: editCase?.case_type ?? 'civil',
    status: editCase?.status ?? 'activo',
  })

  if (!open) return null

  function set(field: string, value: string | number) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const body = { ...form, slug }

      if (editCase) {
        await fetch(`/api/cases/${editCase.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        await fetch('/api/cases', {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">
          {editCase ? 'Editar Caso' : 'Nuevo Caso'}
        </h3>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <Field label="Titulo" value={form.title} onChange={v => set('title', v)} required />
          <Field label="Descripcion" value={form.description} onChange={v => set('description', v)} textarea />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Demandante" value={form.plaintiff_name} onChange={v => set('plaintiff_name', v)} required />
            <Field label="CUIL Demandante" value={form.plaintiff_cuil} onChange={v => set('plaintiff_cuil', v)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Demandado" value={form.defendant_name} onChange={v => set('defendant_name', v)} required />
            <Field label="CUIL Demandado" value={form.defendant_cuil} onChange={v => set('defendant_cuil', v)} />
          </div>

          <Field label="DNI Demandado" value={form.defendant_dni} onChange={v => set('defendant_dni', v)} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deuda Total (USD)</label>
              <input
                type="number"
                value={form.total_debt_usd}
                onChange={e => set('total_debt_usd', Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={form.case_type}
                onChange={e => set('case_type', e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm"
              >
                <option value="civil">Civil</option>
                <option value="penal">Penal</option>
                <option value="laboral">Laboral</option>
                <option value="comercial">Comercial</option>
              </select>
            </div>
          </div>

          {editCase && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm"
              >
                <option value="activo">Activo</option>
                <option value="cerrado">Cerrado</option>
                <option value="archivado">Archivado</option>
                <option value="ganado">Ganado</option>
                <option value="perdido">Perdido</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="rounded-xl bg-green-800 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">
              {saving ? 'Guardando...' : editCase ? 'Guardar Cambios' : 'Crear Caso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, required, textarea }: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean; textarea?: boolean
}) {
  const cls = "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none"
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} className={cls} rows={3} />
      ) : (
        <input type="text" value={value} onChange={e => onChange(e.target.value)} required={required} className={cls} />
      )}
    </div>
  )
}
