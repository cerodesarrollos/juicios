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
  }

  const hasFilters = selectedChapter !== null || search || sender || messageType || keyEvidence || weakPoints

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2.5">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-gray-800">💬 Chat</h1>
          {selectedChapter !== null && (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
              Cap. {selectedChapter}
            </span>
          )}
          {weakPoints && (
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
              Puntos debiles
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Jump to evidence */}
          <form onSubmit={handleJump} className="flex">
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
          {/* Search */}
          <form onSubmit={handleSearch} className="flex">
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
            className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
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
        </div>
      )}

      {/* Main content — two equal columns */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat column — 50% */}
        <div className="flex w-1/2 flex-col overflow-hidden border-r border-gray-200">
          <ChatView
            caseId={caseData.id}
            chapter={selectedChapter}
            search={search}
            sender={sender}
            messageType={messageType}
            keyEvidence={keyEvidence}
            weakPoints={weakPoints}
            selectedId={selectedMessage?.id ?? null}
            onSelect={setSelectedMessage}
            jumpToId={jumpToId}
          />
        </div>

        {/* Evidence detail panel — 50% */}
        <div className="flex w-1/2 flex-col overflow-hidden bg-white">
          <div className="border-b border-gray-200 bg-white px-5 py-3">
            <h2 className="text-sm font-semibold text-gray-800">Detalle de Evidencia</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ChatEvidencePanel message={selectedMessage} />
          </div>
        </div>
      </div>
    </div>
  )
}
