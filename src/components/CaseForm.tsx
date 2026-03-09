'use client'

import { useState } from 'react'
import { Case } from '@/lib/types'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
  editCase?: Case | null
}

const inputCls = "w-full rounded-[14px] border border-white/[0.08] bg-[#111114] px-3 py-2 text-[13px] text-white/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] focus:border-white/[0.15] focus:outline-none placeholder:text-white/15"
const labelCls = "block text-[12px] font-medium text-white/40 mb-1"
const selectCls = "w-full rounded-[14px] border border-white/[0.08] bg-[#111114] px-3 py-2 text-[13px] text-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"

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
        await fetch(`/api/cases/${editCase.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      } else {
        await fetch('/api/cases', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      }
      onSaved()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[20px] p-px bg-gradient-to-b from-[#2a2a2e] to-[#1a1a1d]">
        <div className="rounded-[19px] bg-[#161619] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_32px_-8px_rgba(0,0,0,0.6)]">
          <h3 className="text-[16px] font-semibold text-white/85">
            {editCase ? 'Editar Caso' : 'Nuevo Caso'}
          </h3>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div><label className={labelCls}>Titulo</label><input type="text" value={form.title} onChange={e => set('title', e.target.value)} required className={inputCls} /></div>
            <div><label className={labelCls}>Descripcion</label><textarea value={form.description} onChange={e => set('description', e.target.value)} className={inputCls} rows={3} /></div>

            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>Demandante</label><input type="text" value={form.plaintiff_name} onChange={e => set('plaintiff_name', e.target.value)} required className={inputCls} /></div>
              <div><label className={labelCls}>CUIL Demandante</label><input type="text" value={form.plaintiff_cuil} onChange={e => set('plaintiff_cuil', e.target.value)} className={inputCls} /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>Demandado</label><input type="text" value={form.defendant_name} onChange={e => set('defendant_name', e.target.value)} required className={inputCls} /></div>
              <div><label className={labelCls}>CUIL Demandado</label><input type="text" value={form.defendant_cuil} onChange={e => set('defendant_cuil', e.target.value)} className={inputCls} /></div>
            </div>

            <div><label className={labelCls}>DNI Demandado</label><input type="text" value={form.defendant_dni} onChange={e => set('defendant_dni', e.target.value)} className={inputCls} /></div>

            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelCls}>Deuda Total (USD)</label><input type="number" value={form.total_debt_usd} onChange={e => set('total_debt_usd', Number(e.target.value))} className={inputCls} /></div>
              <div><label className={labelCls}>Tipo</label><select value={form.case_type} onChange={e => set('case_type', e.target.value)} className={selectCls}>
                <option value="civil">Civil</option><option value="penal">Penal</option><option value="laboral">Laboral</option><option value="comercial">Comercial</option>
              </select></div>
            </div>

            {editCase && (
              <div><label className={labelCls}>Estado</label><select value={form.status} onChange={e => set('status', e.target.value)} className={selectCls}>
                <option value="activo">Activo</option><option value="cerrado">Cerrado</option><option value="archivado">Archivado</option><option value="ganado">Ganado</option><option value="perdido">Perdido</option>
              </select></div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="rounded-[12px] border border-white/[0.08] bg-[#1a1a1e] px-4 py-2 text-[13px] font-medium text-white/50 hover:bg-[#1e1e22]">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="rounded-[12px] bg-[#1e1e22] px-4 py-2 text-[13px] font-bold text-white/80 border border-white/[0.08] shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] hover:bg-[#222226] disabled:opacity-50">
                {saving ? 'Guardando...' : editCase ? 'Guardar Cambios' : 'Crear Caso'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
