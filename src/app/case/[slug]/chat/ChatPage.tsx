'use client'

import { useState } from 'react'
import Link from 'next/link'
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
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null)
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
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2.5">
        <div className="flex items-center gap-3">
          <Link
            href={`/case/${caseData.slug}`}
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            &#8592; {caseData.title}
          </Link>
          <span className="text-gray-300">|</span>
          <h1 className="text-sm font-semibold text-gray-800">Chat Completo</h1>
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

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chapter sidebar */}
        <div className="w-52 shrink-0 overflow-y-auto border-r border-gray-200 bg-white">
          <div className="p-3 space-y-0.5">
            <button
              onClick={() => handleChapterClick(null)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                selectedChapter === null && !weakPoints
                  ? 'bg-green-50 font-semibold text-green-800'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>&#128172;</span>
              <span>Chat Completo</span>
            </button>

            <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Capitulos
            </p>

            {chapters.map(ch => (
              <button
                key={ch.chapter}
                onClick={() => handleChapterClick(ch.chapter)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  selectedChapter === ch.chapter
                    ? 'bg-green-50 font-semibold text-green-800'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-xs">{chapterIcons[ch.chapter] || ch.chapter}</span>
                <span className="flex-1 truncate">{ch.name}</span>
                <span className="text-[10px] text-gray-400">{ch.count}</span>
              </button>
            ))}

            <div className="border-t border-gray-100 my-2" />

            <button
              onClick={handleWeakPointsClick}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                weakPoints
                  ? 'bg-red-50 font-semibold text-red-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>&#9888;</span>
              <span className="flex-1">Puntos debiles</span>
              <span className="text-[10px] text-gray-400">{weakPointsCount}</span>
            </button>
          </div>
        </div>

        {/* Chat column */}
        <div className="flex flex-1 flex-col overflow-hidden">
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

        {/* Evidence detail panel */}
        <div className="w-[380px] shrink-0 overflow-hidden border-l border-gray-200 bg-white">
          <div className="sticky top-0 border-b border-gray-200 bg-white px-5 py-3">
            <h2 className="text-sm font-semibold text-gray-800">Detalle de Evidencia</h2>
          </div>
          <ChatEvidencePanel message={selectedMessage} />
        </div>
      </div>
    </div>
  )
}
