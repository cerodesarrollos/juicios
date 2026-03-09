'use client'

import { ActivityLog } from '@/lib/types'
import { Plus, PencilSimple, Trash, UploadSimple } from '@phosphor-icons/react'

function timeAgo(date: string) {
  const now = Date.now()
  const then = new Date(date).getTime()
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return 'hace unos segundos'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`
  return `hace ${Math.floor(diff / 86400)}d`
}

const actionIcons: Record<string, React.ReactNode> = {
  created: <Plus size={14} weight="bold" />,
  updated: <PencilSimple size={14} weight="bold" />,
  deleted: <Trash size={14} weight="bold" />,
  uploaded: <UploadSimple size={14} weight="bold" />,
}

export default function ActivityFeed({ logs }: { logs: ActivityLog[] }) {
  if (logs.length === 0) {
    return <p className="text-[13px] text-white/25">Sin actividad reciente.</p>
  }

  return (
    <div className="space-y-1">
      {logs.slice(0, 15).map((log, i) => (
        <div key={log.id} className={`flex gap-4 py-[14px] ${i < Math.min(logs.length, 15) - 1 ? 'border-b border-white/[0.05]' : ''}`}>
          <div className="mt-0.5 w-9 h-9 rounded-[12px] bg-white/[0.04] border border-white/[0.06] shrink-0 flex items-center justify-center text-white/30">
            {actionIcons[log.action] ?? <Plus size={14} weight="bold" />}
          </div>
          <div className="min-w-0 pt-0.5">
            <p className="text-[13px] font-medium text-white/80 leading-snug">{log.description}</p>
            <p className="text-[11px] text-white/15 mt-1 font-medium">{timeAgo(log.created_at)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
