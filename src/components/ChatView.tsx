'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChatEvidence } from '@/lib/types'
import InlineAudioPlayer from './InlinAudioPlayer'

interface ChapterInfo {
  chapter: number
  name: string
}

interface ChatViewProps {
  caseId: string
  chapter: number | null
  search: string
  sender: string
  messageType: string
  keyEvidence: boolean
  weakPoints: boolean
  dateFrom: string
  dateTo: string
  selectedId: string | null
  onSelect: (msg: ChatEvidence) => void
  jumpToId: string
  showActions?: boolean
  chapters?: ChapterInfo[]
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

function MessageBubble({ msg, isMatias, isSelected, onSelect, showActions, chapters, onUpdate }: {
  msg: ChatEvidence
  isMatias: boolean
  isSelected: boolean
  onSelect: () => void
  showActions?: boolean
  chapters?: ChapterInfo[]
  onUpdate?: (id: string, updates: Partial<ChatEvidence>) => void
}) {
  const [showChapterMenu, setShowChapterMenu] = useState(false)
  const chapterBtnRef = useRef<HTMLButtonElement>(null)
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    if (showChapterMenu && chapterBtnRef.current) {
      const rect = chapterBtnRef.current.getBoundingClientRect()
      const menuHeight = 200 // approximate
      const spaceBelow = window.innerHeight - rect.bottom
      if (spaceBelow < menuHeight) {
        // Open upward
        setMenuPos({ top: rect.top - menuHeight - 4, left: rect.left })
      } else {
        setMenuPos({ top: rect.bottom + 4, left: rect.left })
      }
    }
    if (!showChapterMenu) setMenuPos(null)
  }, [showChapterMenu])
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
        <span className="rounded-lg bg-white/[0.06] px-3 py-1 text-xs text-white/40 italic">
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
      className={`flex items-center ${isMatias ? 'justify-end' : 'justify-start'} mb-1 group`}
    >

      <div
        onClick={onSelect}
        className={`relative max-w-[85%] md:max-w-[75%] rounded-xl px-3 py-2 cursor-pointer transition-shadow ${borderHighlight} ${
          isMatias
            ? 'bg-green-900/40 text-white/90'
            : 'bg-white/[0.08] border border-white/[0.08] text-white/90'
        } ${isSelected ? 'ring-2 ring-green-500 shadow-md shadow-green-500/20' : 'hover:shadow-sm hover:shadow-white/5'}`}
      >
        {/* Sender name */}
        <p className={`text-xs font-semibold mb-0.5 ${isMatias ? 'text-green-400' : 'text-blue-400'}`}>
          {msg.sender}
        </p>

        {/* Message content by type */}
        {isDeleted && (
          <p className="text-sm text-white/30 italic">Este mensaje fue eliminado</p>
        )}

        {isAudio && (
          <div>
            {msg.file_url ? (
              <InlineAudioPlayer
                src={msg.file_url}
                transcription={msg.transcription}
                isOutgoing={isMatias}
              />
            ) : (
              <div className="flex items-center gap-2 text-sm text-white/60">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-800/50 text-green-400">
                  &#9654;
                </span>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full w-3/4 rounded-full bg-green-400" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {isImage && (
          msg.file_url ? (
            <div className="relative -mx-1 -mt-0.5 mb-1 overflow-hidden rounded-lg">
              <img
                src={msg.file_url}
                alt={msg.file_name || 'Imagen'}
                className="max-w-[260px] w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                loading="lazy"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect()
                }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-white/[0.06] p-3 text-sm text-white/50">
              <span className="text-2xl">📷</span>
              <span>{msg.file_name || 'Imagen'}</span>
            </div>
          )
        )}

        {isVideo && (
          msg.file_url ? (
            <div className="relative -mx-1 -mt-0.5 mb-1 overflow-hidden rounded-lg">
              <video
                src={msg.file_url}
                controls
                preload="metadata"
                className="max-w-[260px] w-full rounded-lg"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-white/[0.06] p-3 text-sm text-white/50">
              <span className="text-2xl">🎬</span>
              <span>{msg.file_name || 'Video'}</span>
            </div>
          )
        )}

        {isDocument && (
          msg.file_url ? (
            <div
              className="flex items-center gap-2 rounded-lg bg-white/[0.06] p-3 text-sm text-blue-400 cursor-pointer hover:bg-white/[0.10] transition-colors"
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
            >
              <span className="text-2xl">📄</span>
              <span className="underline truncate">{msg.file_name || 'Documento'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-white/[0.06] p-3 text-sm text-white/50">
              <span className="text-2xl">📄</span>
              <span>{msg.file_name || 'Documento'}</span>
            </div>
          )
        )}

        {isSticker && (
          <div className="flex items-center justify-center p-2 text-4xl">
            &#128522;
          </div>
        )}

        {isContact && (
          <div className="flex items-center gap-2 rounded-lg bg-white/[0.06] p-3 text-sm text-white/50">
            <span className="text-2xl">&#128100;</span>
            <span>{msg.message_text || 'Contacto'}</span>
          </div>
        )}

        {isLocation && (
          <div className="flex items-center gap-2 rounded-lg bg-white/[0.06] p-3 text-sm text-white/50">
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
              msg.is_key_evidence ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'
            }`}>
              {msg.is_key_evidence ? 'Clave' : 'Debil'}
            </span>
          )}
          {msg.chapter > 0 && (
            <span className="inline-block rounded bg-blue-500/20 px-1 py-0.5 text-[10px] font-medium text-blue-400">
              Cap.{msg.chapter}
            </span>
          )}
          <span className="rounded bg-green-800 px-1.5 py-0.5 font-mono text-[10px] text-white opacity-70 group-hover:opacity-100">
            {msg.evidence_id}
          </span>
          <span className="text-[10px] text-white/40">{formatTime(msg.message_date)}</span>
        </div>
      </div>
      {/* Action buttons — appear on hover */}
      <div className={`flex flex-col gap-1 transition-opacity ${isMatias ? 'order-first mr-1.5' : 'ml-1.5'}`}>
        {/* Send to evidence panel */}
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-white/40 shadow-sm ring-1 ring-white/[0.10] hover:bg-green-900/30 hover:text-green-400 hover:ring-green-500/30"
          title="Ver en panel de evidencia"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 7h8M8 4l3 3-3 3" />
          </svg>
        </button>

        {showActions && (
          <>
            {/* Toggle relevant */}
            <button
              onClick={async (e) => {
                e.stopPropagation()
                const newVal = !msg.is_key_evidence
                await fetch('/api/chat-evidence/update', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: msg.id, is_key_evidence: newVal }),
                })
                onUpdate?.(msg.id, { is_key_evidence: newVal })
              }}
              className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full shadow-sm ring-1 transition-colors ${
                msg.is_key_evidence
                  ? 'bg-yellow-100 text-yellow-600 ring-yellow-300'
                  : 'bg-white/[0.08] text-white/40 ring-white/[0.10] hover:bg-yellow-900/30 hover:text-yellow-400 hover:ring-yellow-500/30'
              }`}
              title={msg.is_key_evidence ? 'Quitar relevante' : 'Marcar como relevante'}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill={msg.is_key_evidence ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                <path d="M7 1l1.8 3.6L13 5.3l-3 2.9.7 4.1L7 10.4 3.3 12.3l.7-4.1-3-2.9 4.2-.7z" />
              </svg>
            </button>

            {/* Move to chapter */}
            <div>
              <button
                ref={chapterBtnRef}
                onClick={(e) => { e.stopPropagation(); setShowChapterMenu(!showChapterMenu) }}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-white/40 shadow-sm ring-1 ring-white/[0.10] hover:bg-blue-900/30 hover:text-blue-400 hover:ring-blue-500/30"
                title="Mover a capítulo"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M2 3h4l1.5 1.5H12v7H2z" />
                </svg>
              </button>
              {showChapterMenu && menuPos && chapters && chapters.length > 0 && createPortal(
                <>
                  <div className="fixed inset-0 z-[9998]" onClick={() => setShowChapterMenu(false)} />
                  <div
                    className="fixed z-[9999] w-52 max-h-[200px] overflow-y-auto rounded-lg bg-[#1a1a2e] py-1 shadow-lg ring-1 ring-white/[0.10]"
                    style={{ top: menuPos.top, left: menuPos.left }}
                  >
                    {chapters.map(ch => (
                      <button
                        key={ch.chapter}
                        onClick={async (e) => {
                          e.stopPropagation()
                          await fetch('/api/chat-evidence/update', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: msg.id, chapter: ch.chapter, chapter_name: ch.name }),
                          })
                          onUpdate?.(msg.id, { chapter: ch.chapter, chapter_name: ch.name })
                          setShowChapterMenu(false)
                        }}
                        className={`flex w-full items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors hover:bg-white/[0.08] ${
                          msg.chapter === ch.chapter ? 'font-semibold text-green-400 bg-green-900/30' : 'text-white/70'
                        }`}
                      >
                        <span className="w-4 text-center">{ch.chapter}</span>
                        <span className="truncate">{ch.name}</span>
                      </button>
                    ))}
                  </div>
                </>,
                document.body
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function ChatView({
  caseId, chapter, search, sender, messageType, keyEvidence, weakPoints,
  selectedId, onSelect, jumpToId, showActions, chapters: chaptersList,
  dateFrom, dateTo,
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
    if (dateFrom) params.set('date_from', dateFrom)
    if (dateTo) params.set('date_to', dateTo)

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
  }, [caseId, chapter, search, sender, messageType, keyEvidence, weakPoints, dateFrom, dateTo, loading])

  // Reset when filters change
  useEffect(() => {
    offsetRef.current = 0
    setMessages([])
    setHasMore(true)
    fetchMessages(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId, chapter, search, sender, messageType, keyEvidence, weakPoints, dateFrom, dateTo])

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
    <div ref={scrollRef} className="flex-1 overflow-y-auto bg-[#0b0f14] p-4" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
      {/* Message count */}
      <div className="mb-3 text-center">
        <span className="inline-block rounded-full bg-white/[0.08] px-3 py-1 text-xs text-white/50 shadow-sm">
          {total.toLocaleString()} mensajes{chapter !== null ? ` en capitulo ${chapter}` : ''}
        </span>
      </div>

      {grouped.map((group, gi) => (
        <div key={gi}>
          {/* Date separator */}
          <div className="my-3 flex justify-center">
            <span className="rounded-lg bg-white/[0.08] px-3 py-1 text-xs font-medium text-white/50 shadow-sm">
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
              showActions={showActions}
              chapters={chaptersList}
              onUpdate={(id, updates) => {
                setMessages(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m))
              }}
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
        <div className="py-4 text-center text-xs text-white/30">Fin de los mensajes</div>
      )}
    </div>
  )
}
