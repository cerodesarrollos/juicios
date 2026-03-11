'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Case, ChatEvidence } from '@/lib/types'
import ChatView from '@/components/ChatView'
import ChatEvidencePanel from '@/components/ChatEvidencePanel'

interface ChatPageProps {
  caseData: Case
  chapters: { chapter: number; name: string; count: number }[]
  weakPointsCount: number
}

const chapterIcons = ['', '\u2460', '\u2461', '\u2462', '\u2463', '\u2464']

export default function ChatPage({ caseData, chapters, weakPointsCount }: ChatPageProps) {
  const searchParams = useSearchParams()
  const chapterParam = searchParams.get('chapter')
  const [selectedChapter, setSelectedChapter] = useState<number | null>(
    chapterParam ? parseInt(chapterParam, 10) : null
  )

  // Sync with URL changes (sidebar navigation)
  useEffect(() => {
    const ch = searchParams.get('chapter')
    setSelectedChapter(ch ? parseInt(ch, 10) : null)
  }, [searchParams])
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [sender, setSender] = useState('')
  const [messageType, setMessageType] = useState('')
  const [keyEvidence, setKeyEvidence] = useState(false)
  const [weakPoints, setWeakPoints] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<ChatEvidence | null>(null)
  const [jumpToId, setJumpToId] = useState('')
  const [jumpInput, setJumpInput] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [mobileEvidence, setMobileEvidence] = useState(false)
  const [mobileSearch, setMobileSearch] = useState(false)

  const handleSelectMessage = (msg: ChatEvidence) => {
    setSelectedMessage(msg)
    // Auto-show evidence panel on mobile
    setMobileEvidence(true)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault()
    setJumpToId(jumpInput.trim().toUpperCase())
    setTimeout(() => setJumpToId(''), 100)
  }

  const handleChapterClick = (ch: number | null) => {
    setSelectedChapter(ch)
    setWeakPoints(false)
    setDateFrom('')
    setDateTo('')
  }

  const handleWeakPointsClick = () => {
    setSelectedChapter(null)
    setWeakPoints(true)
  }

  const clearFilters = () => {
    setSelectedChapter(null)
    setSearch('')
    setSearchInput('')
    setSender('')
    setMessageType('')
    setKeyEvidence(false)
    setWeakPoints(false)
    setDateFrom('')
    setDateTo('')
  }

  const hasFilters = selectedChapter !== null || search || sender || messageType || keyEvidence || weakPoints || dateFrom || dateTo

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-3 md:px-4 py-2.5">
        <div className="flex items-center gap-2 md:gap-3">
          <h1 className="text-sm font-semibold text-gray-800">💬 Chat</h1>
          {selectedChapter !== null && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] md:text-xs font-medium text-green-700">
              Cap. {selectedChapter}
            </span>
          )}
          {weakPoints && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] md:text-xs font-medium text-red-700">
              Puntos debiles
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile search toggle */}
          <button
            onClick={() => setMobileSearch(!mobileSearch)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 md:hidden"
          >
            &#128269;
          </button>
          {/* Desktop: Jump + Search inline */}
          <form onSubmit={handleJump} className="hidden md:flex">
            <input
              type="text"
              placeholder="Ir a ID..."
              value={jumpInput}
              onChange={e => setJumpInput(e.target.value)}
              className="w-28 rounded-l-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            />
            <button type="submit" className="rounded-r-lg bg-green-800 px-2.5 py-1.5 text-xs text-white hover:bg-green-700">
              Ir
            </button>
          </form>
          <form onSubmit={handleSearch} className="hidden md:flex">
            <input
              type="text"
              placeholder="Buscar mensajes..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-48 rounded-l-lg border border-gray-200 bg-white px-3 py-1.5 text-xs focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            />
            <button type="submit" className="rounded-r-lg bg-green-800 px-3 py-1.5 text-xs text-white hover:bg-green-700">
              &#128269;
            </button>
          </form>
          {/* Toggle filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`rounded-lg border px-2 md:px-3 py-1.5 text-xs transition-colors ${
              showFilters ? 'border-green-300 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Filtros
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="rounded-lg px-2 py-1.5 text-xs text-red-500 hover:bg-red-50">
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Mobile search bar (expanded) */}
      {mobileSearch && (
        <div className="flex flex-col gap-2 border-b border-gray-200 bg-gray-50 px-3 py-2 md:hidden">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder="Buscar mensajes..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="flex-1 rounded-l-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            />
            <button type="submit" className="rounded-r-lg bg-green-800 px-3 py-2 text-sm text-white hover:bg-green-700">
              &#128269;
            </button>
          </form>
          <form onSubmit={handleJump} className="flex">
            <input
              type="text"
              placeholder="Ir a ID de evidencia..."
              value={jumpInput}
              onChange={e => setJumpInput(e.target.value)}
              className="flex-1 rounded-l-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
            />
            <button type="submit" className="rounded-r-lg bg-green-800 px-3 py-2 text-sm text-white hover:bg-green-700">
              Ir
            </button>
          </form>
        </div>
      )}

      {/* Filters bar */}
      {showFilters && (
        <div className="flex items-center gap-3 border-b border-gray-200 bg-gray-50 px-4 py-2">
          <select
            value={sender}
            onChange={e => setSender(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs focus:border-green-600 focus:outline-none"
          >
            <option value="">Todos los remitentes</option>
            <option value="Matias">Matias</option>
            <option value="Toro">Toro</option>
          </select>
          <select
            value={messageType}
            onChange={e => setMessageType(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs focus:border-green-600 focus:outline-none"
          >
            <option value="">Todos los tipos</option>
            <option value="text">Texto</option>
            <option value="audio">Audio</option>
            <option value="image">Imagen</option>
            <option value="video">Video</option>
            <option value="document">Documento</option>
            <option value="sticker">Sticker</option>
            <option value="deleted">Eliminado</option>
            <option value="system">Sistema</option>
          </select>
          <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={keyEvidence}
              onChange={e => setKeyEvidence(e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            Prueba clave
          </label>
          <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={weakPoints}
              onChange={e => setWeakPoints(e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            Punto debil
          </label>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-600">Desde:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs focus:border-green-600 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-600">Hasta:</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs focus:border-green-600 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Main content — responsive columns */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Chat column — full on mobile, 50% on desktop */}
        <div className="flex w-full md:w-1/2 flex-col overflow-hidden md:border-r border-gray-200">
          <ChatView
            caseId={caseData.id}
            chapter={selectedChapter}
            search={search}
            sender={sender}
            messageType={messageType}
            keyEvidence={keyEvidence}
            weakPoints={weakPoints}
            dateFrom={dateFrom}
            dateTo={dateTo}
            selectedId={selectedMessage?.id ?? null}
            onSelect={handleSelectMessage}
            jumpToId={jumpToId}
            showActions={selectedChapter === null && !weakPoints}
            chapters={chapters.map(c => ({ chapter: c.chapter, name: c.name }))}
          />
        </div>

        {/* Evidence detail panel — slide-up drawer on mobile, 50% on desktop */}
        <div className={`
          fixed inset-x-0 bottom-0 z-50 h-[75vh] transform transition-transform duration-300 ease-in-out bg-[#0d0d14] rounded-t-2xl shadow-2xl
          md:relative md:inset-auto md:z-auto md:h-auto md:transform-none md:rounded-none md:shadow-none md:flex md:w-1/2 md:flex-col
          ${mobileEvidence ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
        `}>
          {/* Mobile drawer handle */}
          <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0d0d14] px-5 py-3 md:rounded-none rounded-t-2xl">
            <h2 className="text-sm font-semibold text-white/80">Detalle de Evidencia</h2>
            <button
              onClick={() => setMobileEvidence(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/40 hover:bg-white/10 md:hidden"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-[#0d0d14]">
            <ChatEvidencePanel message={selectedMessage} />
          </div>
        </div>

        {/* Mobile backdrop */}
        {mobileEvidence && (
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={() => setMobileEvidence(false)}
          />
        )}

        {/* Mobile floating button to toggle evidence */}
        {selectedMessage && !mobileEvidence && (
          <button
            onClick={() => setMobileEvidence(true)}
            className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-green-800 text-white shadow-lg hover:bg-green-700 md:hidden"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
