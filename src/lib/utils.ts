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
    case 'cumplido': return 'text-green-700'
    case 'incumplido': return 'text-red-700'
    case 'pendiente': return 'text-yellow-600'
    case 'parcial': return 'text-blue-600'
    default: return 'text-gray-500'
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

export function statusBadgeClass(status: string): string {
  switch (status) {
    case 'cumplido': return 'bg-green-100 text-green-700'
    case 'incumplido': return 'bg-red-100 text-red-700'
    case 'pendiente': return 'bg-gray-100 text-gray-600'
    case 'parcial': return 'bg-yellow-100 text-yellow-700'
    default: return 'bg-gray-100 text-gray-600'
  }
}

export function typeColor(type: string): string {
  switch (type) {
    case 'pago':
    case 'cuota':
      return 'bg-green-100 text-green-700'
    case 'incumplimiento':
      return 'bg-red-100 text-red-700'
    case 'servicio':
    case 'informe':
      return 'bg-blue-100 text-blue-700'
    case 'acuerdo':
    case 'ajuste':
      return 'bg-yellow-100 text-yellow-700'
    case 'devolucion':
      return 'bg-purple-100 text-purple-700'
    case 'mercaderia':
      return 'bg-orange-100 text-orange-700'
    default:
      return 'bg-gray-100 text-gray-600'
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
