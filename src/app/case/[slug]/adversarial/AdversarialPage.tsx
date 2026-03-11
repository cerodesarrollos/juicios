'use client'

import { useState, useEffect } from 'react'
import { Case, AdversarialRound, AdversarialSession } from '@/lib/types'

interface Props {
  caseData: Case
}

interface Evaluation {
  overall_strength: number
  prosecution_score: number
  defense_score: number
  summary: string
  strong_points: string[]
  weak_points: string[]
  recommendation: string
}

export default function AdversarialPage({ caseData }: Props) {
  const [session, setSession] = useState<AdversarialSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [counterInput, setCounterInput] = useState('')
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [evalLoading, setEvalLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('opus-4')
  const [embeddedCount, setEmbeddedCount] = useState<number | null>(null)
  const [embedding, setEmbedding] = useState(false)
  const [embedStatus, setEmbedStatus] = useState('')

  const models = [
    { key: 'opus-4', label: 'Claude Opus 4', desc: 'Máxima calidad' },
    { key: 'sonnet-4', label: 'Claude Sonnet 4', desc: 'Rápido y preciso' },
    { key: 'sonnet-3.5', label: 'Claude Sonnet 3.5', desc: 'Económico' },
    { key: 'haiku-3.5', label: 'Claude Haiku 3.5', desc: 'Ultra rápido' },
  ]

  useEffect(() => {
    checkEmbedded()
  }, [])

  async function checkEmbedded() {
    try {
      const res = await fetch('/api/adversarial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: caseData.id, action: 'check-embedded' }),
      })
      const data = await res.json()
      setEmbeddedCount(data.count ?? 0)
    } catch {
      setEmbeddedCount(0)
    }
  }

  async function handleEmbed() {
    setEmbedding(true)
    setEmbedStatus('Procesando evidencia...')
    try {
      const res = await fetch('/api/embed-evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: caseData.id }),
      })
      const data = await res.json()
      if (data.error) {
        setEmbedStatus(`Error: ${data.error}`)
      } else {
        setEmbedStatus(`${data.count} fragmentos procesados`)
        setEmbeddedCount(data.count)
      }
    } catch (err) {
      setEmbedStatus('Error al procesar evidencia')
    } finally {
      setEmbedding(false)
    }
  }

  async function apiCall(action: string, extra: Record<string, unknown> = {}) {
    const res = await fetch('/api/adversarial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: caseData.id, action, model: selectedModel, current_rounds: session?.rounds.length ?? 0, ...extra }),
    })
    return res.json()
  }

  async function handleInit() {
    setLoading(true)
    setEvaluation(null)
    try {
      const data = await apiCall('init')
      if (data.error) { alert(`Error: ${data.error}`); setLoading(false); return }
      setSession(data)
    } finally {
      setLoading(false)
    }
  }

  async function handleAutoRound() {
    if (!session) return
    setLoading(true)
    try {
      const data = await apiCall('auto', { previous_rounds: session.rounds })
      const round: AdversarialRound = { ...data.round, number: session.rounds.length + 1 }
      setSession(prev => prev ? {
        ...prev,
        rounds: [...prev.rounds, round],
        overall_score: {
          prosecution: Math.round((prev.overall_score.prosecution + round.prosecution.strength) / 2),
          defense: Math.round((prev.overall_score.defense + round.defense.strength) / 2),
          unresolved_points: prev.overall_score.unresolved_points + (round.round_winner === 'draw' ? 1 : 0),
          resolved_points: prev.overall_score.resolved_points + (round.round_winner !== 'draw' ? 1 : 0),
        },
      } : prev)
    } finally {
      setLoading(false)
    }
  }

  async function handleCounter() {
    if (!session || !counterInput.trim()) return
    setLoading(true)
    try {
      const data = await apiCall('counter', { user_input: counterInput, previous_rounds: session.rounds })
      const round: AdversarialRound = { ...data.round, number: session.rounds.length + 1 }
      setSession(prev => prev ? {
        ...prev,
        rounds: [...prev.rounds, round],
        overall_score: {
          ...prev.overall_score,
          resolved_points: prev.overall_score.resolved_points + 1,
        },
      } : prev)
      setCounterInput('')
    } finally {
      setLoading(false)
    }
  }

  async function handleEvaluate() {
    if (!session) return
    setEvalLoading(true)
    try {
      const data = await apiCall('evaluate', { previous_rounds: session.rounds })
      setEvaluation(data.evaluation)
    } finally {
      setEvalLoading(false)
    }
  }

  const winnerLabel = (w: AdversarialRound['round_winner']) =>
    w === 'prosecution' ? 'Acusacion' : w === 'defense' ? 'Defensa' : 'Empate'

  const winnerColor = (w: AdversarialRound['round_winner']) =>
    w === 'prosecution' ? 'bg-red-900/30 text-red-400' : w === 'defense' ? 'bg-blue-900/30 text-blue-400' : 'bg-white/[0.06] text-white/50'

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-white/[0.08] bg-[#0d0d14] px-4 py-4 md:px-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-white/85">Simulacion Adversarial</h1>
            <p className="text-sm text-white/40">{caseData.plaintiff_name} vs {caseData.defendant_name}</p>
            <div className="mt-2 flex items-center gap-2">
              <label className="text-xs text-white/40">Modelo:</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="rounded-lg border border-white/[0.08] bg-[#111114] px-2 py-1 text-xs text-white/70 focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none"
              >
                {models.map((m) => (
                  <option key={m.key} value={m.key}>{m.label} — {m.desc}</option>
                ))}
              </select>
              {embeddedCount !== null && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${embeddedCount > 0 ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>
                  {embeddedCount > 0 ? `RAG: ${embeddedCount} chunks` : 'Sin RAG'}
                </span>
              )}
            </div>
          </div>
          {session && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-red-900/20 px-3 py-1.5 text-sm">
                <span className="font-medium text-red-400">Acusacion</span>
                <span className="rounded-full bg-red-900/40 px-2 py-0.5 text-xs font-bold text-red-300">{session.overall_score.prosecution}/10</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-blue-900/20 px-3 py-1.5 text-sm">
                <span className="font-medium text-blue-400">Defensa</span>
                <span className="rounded-full bg-blue-900/40 px-2 py-0.5 text-xs font-bold text-blue-300">{session.overall_score.defense}/10</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-white/40">
                <span>Resueltos: {session.overall_score.resolved_points}</span>
                <span>Pendientes: {session.overall_score.unresolved_points}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
        {!session ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="rounded-2xl border border-white/[0.08] bg-[#161619] p-8 text-center shadow-lg max-w-lg">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.06]">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/50">
                  <path d="M3 6l3-3h12l3 3M3 6v12l3 3h12l3-3V6M3 6h18M9 3v3M15 3v3" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-white/85">Simulacion Adversarial</h2>
              <p className="mt-2 text-sm text-white/40">
                El sistema analizara el caso desde ambas perspectivas: acusacion y defensa.
                Generara argumentos, contraargumentos y evaluara la fortaleza de cada posicion
                basandose en la evidencia disponible y articulos legales aplicables.
              </p>

              {embeddedCount !== null && embeddedCount === 0 && (
                <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-900/20 p-4">
                  <p className="text-sm text-yellow-300 mb-3">
                    La evidencia no esta preparada para busqueda semantica. Preparala para obtener mejores resultados.
                  </p>
                  <button
                    onClick={handleEmbed}
                    disabled={embedding}
                    className="rounded-xl bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-500 disabled:opacity-50"
                  >
                    {embedding ? 'Procesando...' : 'Preparar Evidencia'}
                  </button>
                  {embedStatus && (
                    <p className="mt-2 text-xs text-yellow-400">{embedStatus}</p>
                  )}
                </div>
              )}

              {embeddedCount !== null && embeddedCount > 0 && (
                <div className="mt-4 rounded-xl border border-green-500/20 bg-green-900/20 p-3">
                  <p className="text-sm text-green-400">
                    Evidencia preparada: {embeddedCount} fragmentos indexados para busqueda semantica.
                  </p>
                  <button
                    onClick={handleEmbed}
                    disabled={embedding}
                    className="mt-2 text-xs text-green-400 underline hover:text-green-300 disabled:opacity-50"
                  >
                    {embedding ? 'Re-procesando...' : 'Re-procesar evidencia'}
                  </button>
                  {embedStatus && (
                    <p className="mt-1 text-xs text-green-400">{embedStatus}</p>
                  )}
                </div>
              )}

              <button
                onClick={handleInit}
                disabled={loading}
                className="mt-6 rounded-xl bg-green-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? 'Generando...' : 'Iniciar Simulacion'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {session.rounds.map(round => (
              <div key={round.number} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-green-700 px-3 py-1 text-xs font-semibold text-white">
                    Ronda {round.number}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${winnerColor(round.round_winner)}`}>
                    {winnerLabel(round.round_winner)}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {/* Prosecution */}
                  <div className="rounded-2xl border-l-4 border-red-500/60 bg-[#161619] p-5 shadow-lg">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-red-400">ACUSACION</h3>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-white/40">Fuerza</span>
                        <div className="flex h-5 w-20 overflow-hidden rounded-full bg-white/[0.06]">
                          <div className="h-full rounded-full bg-red-500 transition-all" style={{ width: `${round.prosecution.strength * 10}%` }} />
                        </div>
                        <span className="text-xs font-bold text-red-400">{round.prosecution.strength}/10</span>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-white/60">{round.prosecution.argument}</p>
                    {round.prosecution.evidence_refs.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-medium text-white/40">Evidencia citada:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {round.prosecution.evidence_refs.map((ref, i) => (
                            <span key={i} className="rounded-lg bg-red-900/30 px-2 py-0.5 text-xs text-red-400">{ref}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {round.prosecution.legal_articles.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs font-medium text-white/40">Articulos legales:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {round.prosecution.legal_articles.map((art, i) => (
                            <span key={i} className="rounded-lg bg-white/[0.06] px-2 py-0.5 text-xs text-white/50">{art}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Defense */}
                  <div className="rounded-2xl border-l-4 border-blue-500/60 bg-[#161619] p-5 shadow-lg">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-blue-400">DEFENSA</h3>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-white/40">Fuerza</span>
                        <div className="flex h-5 w-20 overflow-hidden rounded-full bg-white/[0.06]">
                          <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${round.defense.strength * 10}%` }} />
                        </div>
                        <span className="text-xs font-bold text-blue-400">{round.defense.strength}/10</span>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-white/60">{round.defense.counterargument}</p>
                    {round.defense.evidence_refs.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-medium text-white/40">Evidencia citada:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {round.defense.evidence_refs.map((ref, i) => (
                            <span key={i} className="rounded-lg bg-blue-900/30 px-2 py-0.5 text-xs text-blue-400">{ref}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {round.defense.legal_articles.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs font-medium text-white/40">Articulos legales:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {round.defense.legal_articles.map((art, i) => (
                            <span key={i} className="rounded-lg bg-white/[0.06] px-2 py-0.5 text-xs text-white/50">{art}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Evaluation */}
            {evaluation && (
              <div className="rounded-2xl border border-green-500/20 bg-green-900/15 p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-green-400">Evaluacion de Fortaleza</h3>
                  <span className="rounded-full bg-green-900/40 px-3 py-1 text-sm font-bold text-green-300">
                    {evaluation.overall_strength}/10
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-white/60">{evaluation.summary}</p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl bg-[#161619] p-4 space-y-2">
                    <h4 className="text-sm font-semibold text-green-400">Puntos fuertes</h4>
                    <ul className="space-y-1">
                      {evaluation.strong_points.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                          <span className="mt-0.5 flex-shrink-0 text-green-400">+</span>{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl bg-[#161619] p-4 space-y-2">
                    <h4 className="text-sm font-semibold text-red-400">Puntos debiles</h4>
                    <ul className="space-y-1">
                      {evaluation.weak_points.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                          <span className="mt-0.5 flex-shrink-0 text-red-400">-</span>{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="rounded-xl bg-[#161619] p-4">
                  <h4 className="text-sm font-semibold text-white/60 mb-1">Recomendacion</h4>
                  <p className="text-sm text-white/50">{evaluation.recommendation}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action bar */}
      {session && (
        <div className="flex-shrink-0 border-t border-white/[0.08] bg-[#0d0d14] px-4 py-3 md:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex flex-1 gap-2">
              <input
                type="text"
                value={counterInput}
                onChange={e => setCounterInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCounter()}
                placeholder="Escribí tu argumento y la IA lo mejora con evidencia y citas legales..."
                className="flex-1 rounded-xl border border-white/[0.08] bg-[#111114] px-4 py-2.5 text-sm text-white/80 shadow-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none placeholder:text-white/20"
              />
              <button
                onClick={handleCounter}
                disabled={loading || !counterInput.trim()}
                className="rounded-xl border border-white/[0.08] bg-[#1a1a1e] px-4 py-2.5 text-sm font-medium text-white/60 hover:bg-[#1e1e22] disabled:opacity-50"
              >
                Contraargumentar
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAutoRound}
                disabled={loading}
                className="rounded-xl bg-green-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? 'Generando...' : 'Auto-ronda'}
              </button>
              <button
                onClick={handleEvaluate}
                disabled={evalLoading}
                className="rounded-xl border border-green-600 px-4 py-2.5 text-sm font-medium text-green-400 hover:bg-green-900/20 disabled:opacity-50"
              >
                {evalLoading ? 'Evaluando...' : 'Evaluar Fortaleza'}
              </button>
              <button
                onClick={handleInit}
                disabled={loading}
                className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-white/40 hover:bg-white/[0.04] disabled:opacity-50"
              >
                Reiniciar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
