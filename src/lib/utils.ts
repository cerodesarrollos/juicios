export function formatUSD(amount: number | null | undefined): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  return new Date(date + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function statusColor(status: string): string {
  switch (status) {
    case 'cumplido': return 'text-accent'
    case 'incumplido': return 'text-danger'
    case 'pendiente': return 'text-warning'
    case 'parcial': return 'text-info'
    default: return 'text-text-muted'
  }
}

export function statusBadge(status: string): string {
  switch (status) {
    case 'cumplido': return '✅'
    case 'incumplido': return '❌'
    case 'pendiente': return '⏳'
    case 'parcial': return '🔄'
    default: return '❓'
  }
}

export function typeColor(type: string): string {
  switch (type) {
    case 'pago':
    case 'cuota':
      return 'bg-green-500/20 text-green-400'
    case 'incumplimiento':
      return 'bg-red-500/20 text-red-400'
    case 'servicio':
    case 'informe':
      return 'bg-blue-500/20 text-blue-400'
    case 'acuerdo':
    case 'ajuste':
      return 'bg-yellow-500/20 text-yellow-400'
    case 'devolucion':
      return 'bg-purple-500/20 text-purple-400'
    case 'mercaderia':
      return 'bg-orange-500/20 text-orange-400'
    default:
      return 'bg-zinc-500/20 text-zinc-400'
  }
}

export function evidenceSlotLabel(slot: string): string {
  switch (slot) {
    case 'comprobante': return 'Comprobante'
    case 'captura': return 'Captura'
    case 'audio': return 'Audio'
    case 'transcripcion': return 'Transcripción'
    default: return slot
  }
}

export function evidenceStatusBadge(status: string): string {
  switch (status) {
    case 'adjuntado': return '✅ Adjuntado'
    case 'pendiente': return '⏳ Pendiente'
    case 'no_existe': return '❌ No existe'
    default: return status
  }
}
