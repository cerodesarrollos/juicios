'use client'

import { useState } from 'react'
import { Party } from '@/lib/types'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  caseId: string
  editParty?: Party | null
}

export default function PartyForm({ open, onClose, onSaved, caseId, editParty }: Props) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: editParty?.name ?? '',
    cuil_cuit: editParty?.cuil_cuit ?? '',
    dni: editParty?.dni ?? '',
    role: editParty?.role ?? 'testigo',
    relationship: editParty?.relationship ?? '',
    phone: editParty?.phone ?? '',
    email: editParty?.email ?? '',
    notes: editParty?.notes ?? '',
  })

  if (!open) return null

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const body = {
        ...form,
        case_id: caseId,
        cuil_cuit: form.cuil_cuit || null,
        dni: form.dni || null,
        relationship: form.relationship || null,
        phone: form.phone || null,
        email: form.email || null,
        notes: form.notes || null,
      }

      if (editParty) {
        await fetch(`/api/parties/${editParty.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        await fetch('/api/parties', {
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

  const roles = ['acreedor', 'deudor', 'intermediario', 'titular_cuenta', 'empleado', 'familiar', 'testigo']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">
          {editParty ? 'Editar Parte' : 'Nueva Parte'}
        </h3>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)} required
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select value={form.role} onChange={e => set('role', e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm">
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CUIL/CUIT</label>
              <input type="text" value={form.cuil_cuit} onChange={e => set('cuil_cuit', e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DNI</label>
              <input type="text" value={form.dni} onChange={e => set('dni', e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Relacion</label>
            <input type="text" value={form.relationship} onChange={e => set('relationship', e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
              <input type="text" value={form.phone} onChange={e => set('phone', e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none" />
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
              {saving ? 'Guardando...' : editParty ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
