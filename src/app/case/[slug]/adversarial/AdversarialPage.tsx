'use client'

import { useState } from 'react'
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

  async function apiCall(action: string, extra: Record<string, unknown> = {}) {
    const res = await fetch('/api/adversarial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ case_id: caseData.id, action, current_rounds: session?.rounds.length ?? 0, ...extra }),
    })
    return res.json()
  }

  async function handleInit() {
    setLoading(true)
    setEvaluation(null)
    try {
      const data: AdversarialSession = await apiCall('init')
      setSession(data)
    } finally {
      setLoading(false)
    }
  }

  async function handleAutoRound() {
    if (!session) return
    setLoading(true)
    try {
      const data = await apiCall('auto')
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
      const data = await apiCall('counter', { user_input: counterInput })
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
      const data = await apiCall('evaluate')
      setEvaluation(data.evaluation)
    } finally {
      setEvalLoading(false)
    }
  }

  const winnerLabel = (w: AdversarialRound['round_winner']) =>
    w === 'prosecution' ? 'Acusacion' : w === 'defense' ? 'Defensa' : 'Empate'

  const winnerColor = (w: AdversarialRound['round_winner']) =>
    w === 'prosecution' ? 'bg-red-100 text-red-700' : w === 'defense' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-4 py-4 md:px-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Simulacion Adversarial</h1>
            <p className="text-sm text-gray-500">{caseData.plaintiff_name} vs {caseData.defendant_name}</p>
          </div>
          {session && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-1.5 text-sm">
                <span className="font-medium text-red-700">Acusacion</span>
                <span className="rounded-full bg-red-200 px-2 py-0.5 text-xs font-bold text-red-800">{session.overall_score.prosecution}/10</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-1.5 text-sm">
                <span className="font-medium text-blue-700">Defensa</span>
                <span className="rounded-full bg-blue-200 px-2 py-0.5 text-xs font-bold text-blue-800">{session.overall_score.defense}/10</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
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
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm max-w-lg">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600">
                  <path d="M3 6l3-3h12l3 3M3 6v12l3 3h12l3-3V6M3 6h18M9 3v3M15 3v3" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Simulacion Adversarial</h2>
              <p className="mt-2 text-sm text-gray-500">
                El sistema analizara el caso desde ambas perspectivas: acusacion y defensa.
                Generara argumentos, contraargumentos y evaluara la fortaleza de cada posicion
                basandose en la evidencia disponible y articulos legales aplicables.
              </p>
              <button
                onClick={handleInit}
                disabled={loading}
                className="mt-6 rounded-xl bg-green-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Generando...' : 'Iniciar Simulacion'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Rounds */}
            {session.rounds.map(round => (
              <div key={round.number} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-green-800 px-3 py-1 text-xs font-semibold text-white">
                    Ronda {round.number}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${winnerColor(round.round_winner)}`}>
                    {winnerLabel(round.round_winner)}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {/* Prosecution panel */}
                  <div className="rounded-2xl border-l-4 border-red-400 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-red-700">ACUSACION</h3>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-500">Fuerza</span>
                        <div className="flex h-5 w-20 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-red-500 transition-all"
                            style={{ width: `${round.prosecution.strength * 10}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-red-700">{round.prosecution.strength}/10</span>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-700">{round.prosecution.argument}</p>
                    {round.prosecution.evidence_refs.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-medium text-gray-500">Evidencia citada:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {round.prosecution.evidence_refs.map((ref, i) => (
                            <span key={i} className="rounded-lg bg-red-50 px-2 py-0.5 text-xs text-red-600">{ref}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {round.prosecution.legal_articles.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs font-medium text-gray-500">Articulos legales:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {round.prosecution.legal_articles.map((art, i) => (
                            <span key={i} className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{art}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Defense panel */}
                  <div className="rounded-2xl border-l-4 border-blue-400 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-blue-700">DEFENSA</h3>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-500">Fuerza</span>
                        <div className="flex h-5 w-20 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all"
                            style={{ width: `${round.defense.strength * 10}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-blue-700">{round.defense.strength}/10</span>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-700">{round.defense.counterargument}</p>
                    {round.defense.evidence_refs.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-medium text-gray-500">Evidencia citada:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {round.defense.evidence_refs.map((ref, i) => (
                            <span key={i} className="rounded-lg bg-blue-50 px-2 py-0.5 text-xs text-blue-600">{ref}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {round.defense.legal_articles.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs font-medium text-gray-500">Articulos legales:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {round.defense.legal_articles.map((art, i) => (
                            <span key={i} className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{art}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Evaluation panel */}
            {evaluation && (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-green-800">Evaluacion de Fortaleza</h3>
                  <span className="rounded-full bg-green-200 px-3 py-1 text-sm font-bold text-green-800">
                    {evaluation.overall_strength}/10
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-gray-700">{evaluation.summary}</p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl bg-white p-4 space-y-2">
                    <h4 className="text-sm font-semibold text-green-700">Puntos fuertes</h4>
                    <ul className="space-y-1">
                      {evaluation.strong_points.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="mt-0.5 flex-shrink-0 text-green-600">+</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl bg-white p-4 space-y-2">
                    <h4 className="text-sm font-semibold text-red-600">Puntos debiles</h4>
                    <ul className="space-y-1">
                      {evaluation.weak_points.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="mt-0.5 flex-shrink-0 text-red-500">-</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-xl bg-white p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">Recomendacion</h4>
                  <p className="text-sm text-gray-600">{evaluation.recommendation}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action bar */}
      {session && (
        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-4 py-3 md:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex flex-1 gap-2">
              <input
                type="text"
                value={counterInput}
                onChange={e => setCounterInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCounter()}
                placeholder="Escribir contraargumento manual..."
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none placeholder:text-gray-400"
              />
              <button
                onClick={handleCounter}
                disabled={loading || !counterInput.trim()}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Contraargumentar
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAutoRound}
                disabled={loading}
                className="rounded-xl bg-green-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Generando...' : 'Auto-ronda'}
              </button>
              <button
                onClick={handleEvaluate}
                disabled={evalLoading}
                className="rounded-xl border border-green-800 px-4 py-2.5 text-sm font-medium text-green-800 hover:bg-green-50 disabled:opacity-50"
              >
                {evalLoading ? 'Evaluando...' : 'Evaluar Fortaleza'}
              </button>
              <button
                onClick={handleInit}
                disabled={loading}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
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
