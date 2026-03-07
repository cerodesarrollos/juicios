'use client'

import { ActivityLog } from '@/lib/types'

function timeAgo(date: string) {
  const now = Date.now()
  const then = new Date(date).getTime()
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return 'hace unos segundos'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`
  return `hace ${Math.floor(diff / 86400)}d`
}

const actionIcons: Record<string, string> = {
  created: '+',
  updated: '~',
  deleted: 'x',
  uploaded: '^',
}

export default function ActivityFeed({ logs }: { logs: ActivityLog[] }) {
  if (logs.length === 0) {
    return <p className="text-sm text-gray-400">Sin actividad reciente.</p>
  }

  return (
    <div className="space-y-2">
      {logs.slice(0, 15).map(log => (
        <div key={log.id} className="flex items-start gap-3 rounded-xl bg-gray-50 p-3">
          <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-800">
            {actionIcons[log.action] ?? '?'}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700">{log.description}</p>
            <p className="text-xs text-gray-400">{timeAgo(log.created_at)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
