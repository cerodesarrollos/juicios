'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChatEvidence } from '@/lib/types'

interface ChatViewProps {
  caseId: string
  chapter: number | null
  search: string
  sender: string
  messageType: string
  keyEvidence: boolean
  weakPoints: boolean
  selectedId: string | null
  onSelect: (msg: ChatEvidence) => void
  jumpToId: string
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

function MessageBubble({ msg, isMatias, isSelected, onSelect }: {
  msg: ChatEvidence
  isMatias: boolean
  isSelected: boolean
  onSelect: () => void
}) {
  const isDeleted = msg.message_type === 'deleted'
  const isSystem = msg.message_type === 'system'
  const isAudio = msg.message_type === 'audio'
  const isImage = msg.message_type === 'image'
  const isVideo = msg.message_type === 'video'
  const isDocument = msg.message_type === 'document'
  const isSticker = msg.message_type === 'sticker'
  const isContact = msg.message_type === 'contact'
  const isLocation = msg.message_type === 'location'

  if (isSystem) {
    return (
      <div className="flex justify-center my-1">
        <span className="rounded-lg bg-gray-100 px-3 py-1 text-xs text-gray-500 italic">
          {msg.message_text}
        </span>
      </div>
    )
  }

  const borderHighlight = msg.is_key_evidence
    ? 'border-l-4 border-yellow-400'
    : msg.is_weak_point
      ? 'border-l-4 border-red-400'
      : ''

  return (
    <div
      id={`msg-${msg.evidence_id}`}
      className={`flex ${isMatias ? 'justify-end' : 'justify-start'} mb-1 group`}
      onClick={onSelect}
    >
      <div
        className={`relative max-w-[75%] rounded-xl px-3 py-2 cursor-pointer transition-shadow ${borderHighlight} ${
          isMatias
            ? 'bg-green-100 text-gray-900'
            : 'bg-white border border-gray-200 text-gray-900'
        } ${isSelected ? 'ring-2 ring-green-500 shadow-md' : 'hover:shadow-sm'}`}
      >
        {/* Sender name */}
        <p className={`text-xs font-semibold mb-0.5 ${isMatias ? 'text-green-700' : 'text-blue-700'}`}>
          {msg.sender}
        </p>

        {/* Message content by type */}
        {isDeleted && (
          <p className="text-sm text-gray-400 italic">Este mensaje fue eliminado</p>
        )}

        {isAudio && (
          <div>
            {msg.file_url ? (
              <audio controls preload="metadata" className="w-full max-w-[240px] h-8">
                <source src={msg.file_url} type="audio/ogg; codecs=opus" />
              </audio>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-200 text-green-700">
                  &#9654;
                </span>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div className="h-full w-3/4 rounded-full bg-green-400" />
                  </div>
                </div>
              </div>
            )}
            {msg.transcription && (
              <p className="mt-1.5 text-sm italic text-gray-500 border-t border-gray-100 pt-1.5">
                {msg.transcription}
              </p>
            )}
          </div>
        )}

        {isImage && (
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
            <span className="text-2xl">&#128247;</span>
            <span>{msg.file_name || 'Imagen'}</span>
          </div>
        )}

        {isVideo && (
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
            <span className="text-2xl">&#127909;</span>
            <span>{msg.file_name || 'Video'}</span>
          </div>
        )}

        {isDocument && (
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
            <span className="text-2xl">&#128196;</span>
            <span>{msg.file_name || 'Documento'}</span>
          </div>
        )}

        {isSticker && (
          <div className="flex items-center justify-center p-2 text-4xl">
            &#128522;
          </div>
        )}

        {isContact && (
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
            <span className="text-2xl">&#128100;</span>
            <span>{msg.message_text || 'Contacto'}</span>
          </div>
        )}

        {isLocation && (
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
            <span className="text-2xl">&#128205;</span>
            <span>{msg.message_text || 'Ubicacion'}</span>
          </div>
        )}

        {!isDeleted && !isAudio && !isImage && !isVideo && !isDocument && !isSticker && !isContact && !isLocation && (
          <p className="text-sm whitespace-pre-wrap break-words">{msg.message_text}</p>
        )}

        {/* Footer: time + evidence badge */}
        <div className="mt-1 flex items-center justify-end gap-1.5">
          {(msg.is_key_evidence || msg.is_weak_point) && (
            <span className={`inline-block rounded px-1 py-0.5 text-[10px] font-medium ${
              msg.is_key_evidence ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
            }`}>
              {msg.is_key_evidence ? 'Clave' : 'Debil'}
            </span>
          )}
          <span className="rounded bg-green-800 px-1.5 py-0.5 font-mono text-[10px] text-white opacity-70 group-hover:opacity-100">
            {msg.evidence_id}
          </span>
          <span className="text-[10px] text-gray-400">{formatTime(msg.message_date)}</span>
        </div>
      </div>
    </div>
  )
}

export default function ChatView({
  caseId, chapter, search, sender, messageType, keyEvidence, weakPoints,
  selectedId, onSelect, jumpToId,
}: ChatViewProps) {
  const [messages, setMessages] = useState<ChatEvidence[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)

  const fetchMessages = useCallback(async (reset: boolean) => {
    if (loading) return
    setLoading(true)
    const offset = reset ? 0 : offsetRef.current
    const params = new URLSearchParams({ case_id: caseId, offset: String(offset), limit: '100' })
    if (chapter !== null) params.set('chapter', String(chapter))
    if (search) params.set('search', search)
    if (sender) params.set('sender', sender)
    if (messageType) params.set('message_type', messageType)
    if (keyEvidence) params.set('key_evidence', 'true')
    if (weakPoints) params.set('weak_points', 'true')

    const res = await fetch(`/api/chat-evidence?${params}`)
    const json = await res.json()
    const newMsgs: ChatEvidence[] = json.data ?? []
    setTotal(json.total ?? 0)

    if (reset) {
      setMessages(newMsgs)
      offsetRef.current = newMsgs.length
      scrollRef.current?.scrollTo(0, 0)
    } else {
      setMessages(prev => [...prev, ...newMsgs])
      offsetRef.current += newMsgs.length
    }
    setHasMore(newMsgs.length === 100)
    setLoading(false)
  }, [caseId, chapter, search, sender, messageType, keyEvidence, weakPoints, loading])

  // Reset when filters change
  useEffect(() => {
    offsetRef.current = 0
    setMessages([])
    setHasMore(true)
    fetchMessages(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId, chapter, search, sender, messageType, keyEvidence, weakPoints])

  // Infinite scroll observer
  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchMessages(false)
        }
      },
      { root: scrollRef.current, threshold: 0.1 }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, fetchMessages])

  // Jump to evidence_id
  useEffect(() => {
    if (!jumpToId) return
    const el = document.getElementById(`msg-${jumpToId}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('animate-pulse')
      setTimeout(() => el.classList.remove('animate-pulse'), 2000)
    }
  }, [jumpToId, messages])

  // Group messages by date
  const grouped: { date: string; msgs: ChatEvidence[] }[] = []
  let currentDate = ''
  for (const msg of messages) {
    const d = msg.message_date.split('T')[0]
    if (d !== currentDate) {
      currentDate = d
      grouped.push({ date: msg.message_date, msgs: [] })
    }
    grouped[grouped.length - 1].msgs.push(msg)
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto bg-[#f0ebe3] p-4" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d5cec4\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
      {/* Message count */}
      <div className="mb-3 text-center">
        <span className="inline-block rounded-full bg-white/80 px-3 py-1 text-xs text-gray-500 shadow-sm">
          {total.toLocaleString()} mensajes{chapter !== null ? ` en capitulo ${chapter}` : ''}
        </span>
      </div>

      {grouped.map((group, gi) => (
        <div key={gi}>
          {/* Date separator */}
          <div className="my-3 flex justify-center">
            <span className="rounded-lg bg-white/80 px-3 py-1 text-xs font-medium text-gray-500 shadow-sm">
              {formatDate(group.date)}
            </span>
          </div>
          {group.msgs.map(msg => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isMatias={msg.sender?.toLowerCase().includes('matias') || msg.sender?.toLowerCase().includes('matías')}
              isSelected={selectedId === msg.id}
              onSelect={() => onSelect(msg)}
            />
          ))}
        </div>
      ))}

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} className="h-8" />
      {loading && (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-800 border-t-transparent" />
        </div>
      )}
      {!hasMore && messages.length > 0 && (
        <div className="py-4 text-center text-xs text-gray-400">Fin de los mensajes</div>
      )}
    </div>
  )
}
