import { supabaseServer } from '@/lib/supabase-server'
import { Transaction, TimelineEvent } from '@/lib/types'
import { formatUSD, formatDate, statusBadge, typeColor } from '@/lib/utils'

export const revalidate = 60

export default async function TimelinePage() {
  // Get timeline events
  const { data: events } = await supabaseServer
    .from('timeline_events')
    .select('*')
    .order('date')

  // Also get transactions as timeline items
  const { data: transactions } = await supabaseServer
    .from('transactions')
    .select('*, from_party:parties!transactions_from_party_id_fkey(name), to_party:parties!transactions_to_party_id_fkey(name)')
    .order('date')

  const timelineEvents = (events ?? []) as TimelineEvent[]
  const txList = (transactions ?? []) as (Transaction & { from_party: { name: string } | null; to_party: { name: string } | null })[]

  // Merge into a single timeline
  type TimelineItem = { date: string; type: 'event' | 'transaction'; event?: TimelineEvent; transaction?: typeof txList[0] }
  const items: TimelineItem[] = [
    ...timelineEvents.map(e => ({ date: e.date, type: 'event' as const, event: e })),
    ...txList.map(t => ({ date: t.date, type: 'transaction' as const, transaction: t })),
  ].sort((a, b) => a.date.localeCompare(b.date))

  // Group by month
  const grouped: Record<string, TimelineItem[]> = {}
  for (const item of items) {
    const month = item.date.substring(0, 7) // YYYY-MM
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
        <h1 className="text-2xl font-bold">Línea de Tiempo</h1>
        <p className="mt-1 text-sm text-text-muted">{items.length} eventos registrados</p>
      </div>

      <div className="relative space-y-8 pl-8 before:absolute before:left-3 before:top-0 before:h-full before:w-0.5 before:bg-border">
        {Object.entries(grouped).map(([month, monthItems]) => (
          <div key={month} className="space-y-4">
            <h2 className="relative -ml-8 text-lg font-semibold">
              <span className="absolute -left-0.5 top-1.5 h-3 w-3 rounded-full bg-accent" />
              <span className="ml-8">{monthLabel(month)}</span>
            </h2>

            {monthItems.map((item, i) => (
              <div key={i} className="relative">
                <span className="absolute -left-[1.375rem] top-2 h-2 w-2 rounded-full bg-text-muted" />
                {item.type === 'transaction' && item.transaction ? (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-accent">{item.transaction.proof_id}</span>
                      <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${typeColor(item.transaction.type)}`}>
                        {item.transaction.type}
                      </span>
                      <span className="text-xs text-text-muted">{formatDate(item.date)}</span>
                    </div>
                    <p className="mt-2 text-sm">{item.transaction.concept}</p>
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <span className="font-bold">{formatUSD(item.transaction.amount_usd)}</span>
                      <span className="text-text-muted">
                        {item.transaction.from_party?.name ?? '—'} → {item.transaction.to_party?.name ?? '—'}
                      </span>
                      <span>{statusBadge(item.transaction.status)} {item.transaction.status}</span>
                    </div>
                  </div>
                ) : item.event ? (
                  <div className="rounded-xl border border-accent/20 bg-accent/5 p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-accent">{item.event.title}</span>
                      <span className="text-xs text-text-muted">{formatDate(item.date)}</span>
                    </div>
                    {item.event.description && (
                      <p className="mt-1 text-sm text-text-muted">{item.event.description}</p>
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
