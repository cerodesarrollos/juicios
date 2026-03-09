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

const inputCls = "w-full rounded-[14px] border border-white/[0.08] bg-[#111114] px-3 py-2 text-[13px] text-white/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus:border-white/[0.15] focus:outline-none"
const labelCls = "block text-[12px] font-medium text-white/40 mb-1"
const selectCls = "w-full rounded-[14px] border border-white/[0.08] bg-[#111114] px-3 py-2 text-[13px] text-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"

export default function PartyForm({ open, onClose, onSaved, caseId, editParty }: Props) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: editParty?.name ?? '', cuil_cuit: editParty?.cuil_cuit ?? '', dni: editParty?.dni ?? '',
    role: editParty?.role ?? 'testigo', relationship: editParty?.relationship ?? '',
    phone: editParty?.phone ?? '', email: editParty?.email ?? '', notes: editParty?.notes ?? '',
  })

  if (!open) return null
  function set(field: string, value: string) { setForm(f => ({ ...f, [field]: value })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      const body = { ...form, case_id: caseId, cuil_cuit: form.cuil_cuit || null, dni: form.dni || null, relationship: form.relationship || null, phone: form.phone || null, email: form.email || null, notes: form.notes || null }
      if (editParty) { await fetch(`/api/parties/${editParty.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }) }
      else { await fetch('/api/parties', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }) }
      onSaved(); onClose()
    } finally { setSaving(false) }
  }

  const roles = ['acreedor', 'deudor', 'intermediario', 'titular_cuenta', 'empleado', 'familiar', 'testigo']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[20px] p-px bg-gradient-to-b from-[#2a2a2e] to-[#1a1a1d]">
        <div className="rounded-[19px] bg-[#161619] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_32px_-8px_rgba(0,0,0,0.6)]">
          <h3 className="text-[16px] font-semibold text-white/85">{editParty ? 'Editar Parte' : 'Nueva Parte'}</h3>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div><label className={labelCls}>Nombre</label><input type="text" value={form.name} onChange={e => set('name', e.target.value)} required className={inputCls} /></div>
            <div><label className={labelCls}>Rol</label><select value={form.role} onChange={e => set('role', e.target.value)} className={selectCls}>{roles.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>CUIL/CUIT</label><input type="text" value={form.cuil_cuit} onChange={e => set('cuil_cuit', e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>DNI</label><input type="text" value={form.dni} onChange={e => set('dni', e.target.value)} className={inputCls} /></div>
            </div>
            <div><label className={labelCls}>Relacion</label><input type="text" value={form.relationship} onChange={e => set('relationship', e.target.value)} className={inputCls} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>Telefono</label><input type="text" value={form.phone} onChange={e => set('phone', e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Email</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={inputCls} /></div>
            </div>
            <div><label className={labelCls}>Notas</label><textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className={inputCls} /></div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="rounded-[12px] border border-white/[0.08] bg-[#1a1a1e] px-4 py-2 text-[13px] font-medium text-white/50 hover:bg-[#1e1e22]">Cancelar</button>
              <button type="submit" disabled={saving} className="rounded-[12px] bg-[#1e1e22] px-4 py-2 text-[13px] font-bold text-white/80 border border-white/[0.08] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] hover:bg-[#222226] disabled:opacity-50">
                {saving ? 'Guardando...' : editParty ? 'Guardar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
