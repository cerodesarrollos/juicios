import { supabaseServer } from '@/lib/supabase-server'
import { Transaction, TimelineEvent } from '@/lib/types'
import { formatUSD, formatDate, statusBadge, typeColor, statusBadgeClass } from '@/lib/utils'

export const revalidate = 60

export default async function TimelinePage() {
  const { data: events } = await supabaseServer
    .from('timeline_events')
    .select('*')
    .order('date')

  const { data: transactions } = await supabaseServer
    .from('transactions')
    .select('*, from_party:parties!transactions_from_party_id_fkey(name), to_party:parties!transactions_to_party_id_fkey(name)')
    .order('date')

  const timelineEvents = (events ?? []) as TimelineEvent[]
  const txList = (transactions ?? []) as (Transaction & { from_party: { name: string } | null; to_party: { name: string } | null })[]

  type TimelineItem = { date: string; type: 'event' | 'transaction'; event?: TimelineEvent; transaction?: typeof txList[0] }
  const items: TimelineItem[] = [
    ...timelineEvents.map(e => ({ date: e.date, type: 'event' as const, event: e })),
    ...txList.map(t => ({ date: t.date, type: 'transaction' as const, transaction: t })),
  ].sort((a, b) => a.date.localeCompare(b.date))

  const grouped: Record<string, TimelineItem[]> = {}
  for (const item of items) {
    const month = item.date.substring(0, 7)
    if (!grouped[month]) grouped[month] = []
    grouped[month].push(item)
  }

  const monthLabel = (ym: string) => {
    const [y, m] = ym.split('-')
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    return `${months[parseInt(m) - 1]} ${y}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Línea de Tiempo</h1>
        <p className="mt-1 text-sm text-gray-500">{items.length} eventos registrados</p>
      </div>

      <div className="relative space-y-8 pl-8 before:absolute before:left-3 before:top-0 before:h-full before:w-0.5 before:bg-gray-200">
        {Object.entries(grouped).map(([month, monthItems]) => (
          <div key={month} className="space-y-4">
            <h2 className="relative -ml-8 text-lg font-semibold text-gray-900">
              <span className="absolute -left-0.5 top-1.5 h-3 w-3 rounded-full bg-green-800" />
              <span className="ml-8">{monthLabel(month)}</span>
            </h2>

            {monthItems.map((item, i) => (
              <div key={i} className="relative">
                <span className="absolute -left-[1.375rem] top-2 h-2 w-2 rounded-full bg-gray-400" />
                {item.type === 'transaction' && item.transaction ? (
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="rounded-lg bg-green-800 px-2.5 py-1 text-xs font-semibold text-white">{item.transaction.proof_id}</span>
                      <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${typeColor(item.transaction.type)}`}>
                        {item.transaction.type}
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(item.date)}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{item.transaction.concept}</p>
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <span className="font-bold text-gray-900">{formatUSD(item.transaction.amount_usd)}</span>
                      <span className="text-gray-500">
                        {item.transaction.from_party?.name ?? '—'} → {item.transaction.to_party?.name ?? '—'}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(item.transaction.status)}`}>
                        {statusBadge(item.transaction.status)} {item.transaction.status}
                      </span>
                    </div>
                  </div>
                ) : item.event ? (
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-green-800">{item.event.title}</span>
                      <span className="text-xs text-gray-500">{formatDate(item.date)}</span>
                    </div>
                    {item.event.description && (
                      <p className="mt-1 text-sm text-gray-600">{item.event.description}</p>
                    )}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
