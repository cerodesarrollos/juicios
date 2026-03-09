'use client'

interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Eliminar', onConfirm, onCancel }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-[20px] p-px bg-gradient-to-b from-[#2a2a2e] to-[#1a1a1d]">
        <div className="rounded-[19px] bg-[#161619] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_32px_-8px_rgba(0,0,0,0.6)]">
          <h3 className="text-[16px] font-semibold text-white/85">{title}</h3>
          <p className="mt-2 text-[13px] text-white/40">{message}</p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="rounded-[12px] border border-white/[0.08] bg-[#1a1a1e] px-4 py-2 text-[13px] font-medium text-white/50 hover:bg-[#1e1e22]"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="rounded-[12px] border border-white/[0.08] bg-[#1e1e22] px-4 py-2 text-[13px] font-semibold text-white/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] hover:bg-[#222226]"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
