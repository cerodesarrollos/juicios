'use client'

import { useState, useEffect } from 'react'
import { Case } from '@/lib/types'

interface Charge {
  id: string
  type: 'cargo' | 'cautelar'
  name: string
  description: string
  status?: 'pending' | 'strong' | 'weak' | 'insufficient'
  strength?: number
  evidence_refs?: string[]
  legal_articles?: string[]
  ai_analysis?: string
  ai_suggestions?: string[]
  missing_evidence?: string[]
}

interface SuggestedCharge {
  name: string
  type: 'cargo' | 'cautelar'
  reason: string
  estimated_strength: number
}

interface WeakCharge {
  name: string
  reason: string
}

interface AnalysisResult {
  charges: Charge[]
  suggested_charges: SuggestedCharge[]
  weak_charges: WeakCharge[]
  overall_strength: number
  summary: string
}

interface Props {
  caseData: Case
}

const PRESET_CHARGES = [
  { name: 'Estafa', type: 'cargo' as const, description: 'Art. 172 CP - Defraudación mediante ardid o engaño' },
  { name: 'Usura', type: 'cargo' as const, description: 'Art. 175 bis CP - Aprovechamiento de necesidad, ligereza o inexperiencia' },
  { name: 'Administración fraudulenta', type: 'cargo' as const, description: 'Art. 173 inc. 7 CP - Administración infiel de bienes ajenos' },
  { name: 'Lavado de activos', type: 'cargo' as const, description: 'Ley 25.246 - Operaciones sospechosas con fondos de origen ilícito' },
  { name: 'Embargo preventivo', type: 'cautelar' as const, description: 'Medida cautelar sobre bienes del demandado' },
  { name: 'Secuestro de vehículo', type: 'cautelar' as const, description: 'Secuestro judicial de vehículo en posesión indebida' },
  { name: 'Velo societario (SAS)', type: 'cargo' as const, description: 'Inoponibilidad de personalidad jurídica - Art. 54 LGS' },
  { name: 'Prohibición de salida del país', type: 'cautelar' as const, description: 'Restricción migratoria como medida cautelar' },
  { name: 'Inhibición general de bienes', type: 'cautelar' as const, description: 'Impedimento de disposición de bienes registrables' },
]

function getStrengthColor(strength: number): string {
  if (strength >= 70) return 'text-green-400 bg-green-900/20 border-green-500/20'
  if (strength >= 40) return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/20'
  return 'text-red-400 bg-red-900/20 border-red-500/20'
}

function getStrengthLabel(strength: number): string {
  if (strength >= 70) return 'FUERTE'
  if (strength >= 40) return 'MODERADO'
  return 'DÉBIL'
}

function getStatusIcon(status?: string): string {
  switch (status) {
    case 'strong': return '✅'
    case 'weak': return '⚠️'
    case 'insufficient': return '❌'
    default: return '⏳'
  }
}

export default function StrategyPage({ caseData }: Props) {
  const [charges, setCharges] = useState<Charge[]>([])
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [expandedCharge, setExpandedCharge] = useState<string | null>(null)
  const [singleLoading, setSingleLoading] = useState<string | null>(null)
  const [singleAnalysis, setSingleAnalysis] = useState<Record<string, Record<string, unknown>>>({})

  const [contextText, setContextText] = useState('')
  const [contextTitle, setContextTitle] = useState('')
  const [contextSaving, setContextSaving] = useState(false)
  const [contextEntries, setContextEntries] = useState<Array<{ id: string; title: string; description: string; original_date: string }>>([])

  const [videoTitle, setVideoTitle] = useState('')
  const [videoDesc, setVideoDesc] = useState('')
  const [videoDate, setVideoDate] = useState('')
  const [videoLocation, setVideoLocation] = useState('')
  const [videoSource, setVideoSource] = useState('')
  const [videoLink, setVideoLink] = useState('')
  const [videoSaving, setVideoSaving] = useState(false)

  const [embeddedCount, setEmbeddedCount] = useState<number | null>(null)
  const [embedding, setEmbedding] = useState(false)
  const [embedResult, setEmbedResult] = useState('')

  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<'cargo' | 'cautelar'>('cargo')
  const [newDesc, setNewDesc] = useState('')
  const [showPresets, setShowPresets] = useState(false)

  useEffect(() => {
    loadContextEntries()
    loadEmbeddedCount()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadContextEntries() {
    try {
      const res = await fetch(`/api/evidence?case_id=${caseData.id}&evidence_type=attorney_context`)
      const data = await res.json()
      if (data.evidence) setContextEntries(data.evidence)
    } catch { /* ignore */ }
  }

  async function loadEmbeddedCount() {
    try {
      const res = await fetch(`/api/embed-evidence/count?case_id=${caseData.id}`)
      const data = await res.json()
      if (typeof data.count === 'number') setEmbeddedCount(data.count)
    } catch { /* ignore */ }
  }

  async function saveContext() {
    if (!contextText.trim()) return
    setContextSaving(true)
    try {
      const res = await fetch('/api/evidence-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseData.id,
          evidence_type: 'attorney_context',
          title: contextTitle || 'Nota del abogado',
          description: contextText,
          date: new Date().toISOString().split('T')[0],
        }),
      })
      const data = await res.json()
      if (!data.error) {
        setContextText('')
        setContextTitle('')
        loadContextEntries()
      } else {
        alert(data.error)
      }
    } catch (err) {
      alert(`Error: ${err}`)
    } finally {
      setContextSaving(false)
    }
  }

  async function saveVideo() {
    if (!videoTitle.trim() || !videoDesc.trim()) return
    setVideoSaving(true)
    try {
      const res = await fetch('/api/evidence-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          case_id: caseData.id,
          evidence_type: 'video',
          title: videoTitle,
          description: videoDesc,
          date: videoDate || null,
          location: videoLocation || null,
          source: videoSource || null,
          link: videoLink || null,
        }),
      })
      const data = await res.json()
      if (!data.error) {
        setVideoTitle(''); setVideoDesc(''); setVideoDate(''); setVideoLocation(''); setVideoSource(''); setVideoLink('')
        alert('Evidencia de video guardada')
      } else { alert(data.error) }
    } catch (err) { alert(`Error: ${err}`) }
    finally { setVideoSaving(false) }
  }

  async function reEmbed() {
    setEmbedding(true); setEmbedResult('')
    try {
      const res = await fetch('/api/embed-evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: caseData.id }),
      })
      const data = await res.json()
      if (data.error) { setEmbedResult(`Error: ${data.error}`) }
      else { setEmbedResult(data.message || `${data.count} fragmentos procesados`); setEmbeddedCount(data.count) }
    } catch (err) { setEmbedResult(`Error: ${err}`) }
    finally { setEmbedding(false) }
  }

  function addCharge(name: string, type: 'cargo' | 'cautelar', description: string) {
    const id = `charge-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setCharges(prev => [...prev, { id, type, name, description }])
    setNewName(''); setNewDesc(''); setShowPresets(false)
  }

  function removeCharge(id: string) { setCharges(prev => prev.filter(c => c.id !== id)) }

  async function analyzeAll() {
    if (charges.length === 0) return
    setLoading(true); setAnalysis(null)
    try {
      const res = await fetch('/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: caseData.id, action: 'analyze', charges: charges.map(c => ({ name: c.name, type: c.type, description: c.description })) }),
      })
      const data = await res.json()
      if (data.error) { alert(`Error: ${data.error}`) }
      else {
        setAnalysis(data)
        if (data.charges) { setCharges(prev => prev.map((c, i) => { const analyzed = data.charges[i]; return analyzed ? { ...c, ...analyzed, id: c.id } : c })) }
      }
    } catch (err) { alert(`Error: ${err}`) }
    finally { setLoading(false) }
  }

  async function analyzeSingle(charge: Charge) {
    setSingleLoading(charge.id)
    try {
      const res = await fetch('/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ case_id: caseData.id, action: 'analyze-single', charge: { name: charge.name, type: charge.type, description: charge.description } }),
      })
      const data = await res.json()
      if (!data.error) { setSingleAnalysis(prev => ({ ...prev, [charge.id]: data as Record<string, unknown> })); setExpandedCharge(charge.id) }
    } catch (err) { alert(`Error: ${err}`) }
    finally { setSingleLoading(null) }
  }

  function addSuggested(s: SuggestedCharge) { addCharge(s.name, s.type, s.reason) }

  const inputCls = "w-full rounded-lg border border-white/[0.08] bg-[#111114] px-3 py-2 text-sm text-white/70 focus:border-green-500 focus:ring-1 focus:ring-green-500 placeholder:text-white/20"
  const cardCls = "bg-[#161619] rounded-lg border border-white/[0.08] p-4 space-y-3"

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-white/[0.08] pb-4">
        <h1 className="text-2xl font-bold text-white/85">⚖️ Estrategia del Caso</h1>
        <p className="text-sm text-white/40 mt-1">
          Definí los cargos y pedidos cautelares. La IA analiza la evidencia y evalúa la viabilidad de cada uno.
        </p>
      </div>

      {/* Attorney Context */}
      <div className={cardCls}>
        <h2 className="text-lg font-semibold text-white/70">Contexto del Abogado</h2>
        <p className="text-xs text-white/30">Notas, observaciones y contexto que la IA considerará al analizar los cargos.</p>
        {contextEntries.length > 0 && (
          <div className="space-y-2">
            {contextEntries.map(entry => (
              <div key={entry.id} className="p-2 bg-white/[0.03] rounded border border-white/[0.06] text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-white/70">{entry.title}</span>
                  <span className="text-xs text-white/25">{entry.original_date}</span>
                </div>
                <p className="text-white/50 mt-1 whitespace-pre-wrap">{entry.description}</p>
              </div>
            ))}
          </div>
        )}
        <div className="space-y-2">
          <input type="text" value={contextTitle} onChange={e => setContextTitle(e.target.value)} placeholder="Título (ej: Conversación con testigo)" className={inputCls} />
          <textarea value={contextText} onChange={e => setContextText(e.target.value)} placeholder="Escribí notas, observaciones, contexto relevante del caso..." rows={3} className={`${inputCls} resize-y`} />
          <button onClick={saveContext} disabled={contextSaving || !contextText.trim()} className="px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed">
            {contextSaving ? 'Guardando...' : 'Guardar Contexto'}
          </button>
        </div>
      </div>

      {/* Video Evidence */}
      <div className={cardCls}>
        <h2 className="text-lg font-semibold text-white/70">Agregar Evidencia de Video</h2>
        <p className="text-xs text-white/30">Registrá videos como evidencia. La descripción será indexada para búsqueda.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input type="text" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} placeholder="Título del video *" className={inputCls} />
          <input type="text" value={videoSource} onChange={e => setVideoSource(e.target.value)} placeholder="Fuente (ej: Instagram, WhatsApp)" className={inputCls} />
          <input type="date" value={videoDate} onChange={e => setVideoDate(e.target.value)} className={inputCls} />
          <input type="text" value={videoLocation} onChange={e => setVideoLocation(e.target.value)} placeholder="Ubicación" className={inputCls} />
          <input type="url" value={videoLink} onChange={e => setVideoLink(e.target.value)} placeholder="Link/URL del video" className={`md:col-span-2 ${inputCls}`} />
        </div>
        <textarea value={videoDesc} onChange={e => setVideoDesc(e.target.value)} placeholder="Descripción de lo que se ve en el video (esto se usará para búsqueda) *" rows={2} className={`${inputCls} resize-y`} />
        <button onClick={saveVideo} disabled={videoSaving || !videoTitle.trim() || !videoDesc.trim()} className="px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed">
          {videoSaving ? 'Guardando...' : 'Guardar Video'}
        </button>
      </div>

      {/* Re-embed */}
      <div className="bg-[#161619] rounded-lg border border-white/[0.08] p-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white/70">Embeddings de Evidencia</h2>
          <p className="text-xs text-white/40">
            {embeddedCount !== null ? `${embeddedCount} fragmentos indexados` : 'Cargando...'}
            {embedResult && <span className="ml-2 text-green-400">{embedResult}</span>}
          </p>
        </div>
        <button onClick={reEmbed} disabled={embedding} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex-shrink-0">
          {embedding ? 'Procesando...' : 'Re-embeddear Evidencia'}
        </button>
      </div>

      {/* Charges */}
      <div className={cardCls}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white/70">Cargos y Cautelares</h2>
          <button onClick={() => setShowPresets(!showPresets)} className="text-sm text-blue-400 hover:text-blue-300 font-medium">
            {showPresets ? 'Cerrar presets' : '+ Agregar desde presets'}
          </button>
        </div>

        {showPresets && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 bg-white/[0.02] rounded-lg">
            {PRESET_CHARGES.filter(p => !charges.some(c => c.name === p.name)).map(preset => (
              <button
                key={preset.name}
                onClick={() => addCharge(preset.name, preset.type, preset.description)}
                className="flex items-start gap-2 text-left p-2 rounded hover:bg-white/[0.04] border border-transparent hover:border-white/[0.08] transition-colors"
              >
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                  preset.type === 'cargo' ? 'bg-red-900/30 text-red-400' : 'bg-blue-900/30 text-blue-400'
                }`}>
                  {preset.type === 'cargo' ? 'CARGO' : 'CAUTELAR'}
                </span>
                <div>
                  <p className="text-sm font-medium text-white/70">{preset.name}</p>
                  <p className="text-xs text-white/35">{preset.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Custom form */}
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-white/35 mb-1">Nombre</label>
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ej: Defraudación por retención indebida" className={inputCls} />
          </div>
          <div className="w-32">
            <label className="block text-xs font-medium text-white/35 mb-1">Tipo</label>
            <select value={newType} onChange={e => setNewType(e.target.value as 'cargo' | 'cautelar')} className={inputCls}>
              <option value="cargo">Cargo</option>
              <option value="cautelar">Cautelar</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-white/35 mb-1">Descripción</label>
            <input type="text" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Descripción breve..." className={inputCls} />
          </div>
          <button onClick={() => newName && addCharge(newName, newType, newDesc || newName)} disabled={!newName} className="px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed">
            Agregar
          </button>
        </div>

        {/* Charges list */}
        {charges.length > 0 && (
          <div className="space-y-2">
            {charges.map(charge => (
              <div key={charge.id} className={`border rounded-lg overflow-hidden ${
                charge.status ? getStrengthColor(charge.strength || 0) : 'border-white/[0.08] bg-[#111114]'
              }`}>
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-lg">{getStatusIcon(charge.status)}</span>
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                      charge.type === 'cargo' ? 'bg-red-900/30 text-red-400' : 'bg-blue-900/30 text-blue-400'
                    }`}>
                      {charge.type === 'cargo' ? 'CARGO' : 'CAUTELAR'}
                    </span>
                    <span className="font-medium text-sm text-white/80">{charge.name}</span>
                    {charge.strength !== undefined && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${getStrengthColor(charge.strength)}`}>
                        {charge.strength}% — {getStrengthLabel(charge.strength)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => analyzeSingle(charge)} disabled={singleLoading === charge.id} className="text-xs text-blue-400 hover:text-blue-300 font-medium disabled:opacity-50">
                      {singleLoading === charge.id ? '⏳ Analizando...' : '🔍 Análisis profundo'}
                    </button>
                    <button onClick={() => setExpandedCharge(expandedCharge === charge.id ? null : charge.id)} className="text-xs text-white/40 hover:text-white/60">
                      {expandedCharge === charge.id ? '▲' : '▼'}
                    </button>
                    <button onClick={() => removeCharge(charge.id)} className="text-xs text-red-400 hover:text-red-300 font-medium">✕</button>
                  </div>
                </div>

                {expandedCharge === charge.id && (
                  <div className="border-t border-white/[0.06] p-4 space-y-3 bg-white/[0.02]">
                    <p className="text-sm text-white/50">{charge.description}</p>
                    {charge.ai_analysis && (
                      <div>
                        <h4 className="text-xs font-semibold text-white/35 uppercase mb-1">Análisis IA</h4>
                        <p className="text-sm text-white/60 whitespace-pre-wrap">{charge.ai_analysis}</p>
                      </div>
                    )}
                    {charge.legal_articles && charge.legal_articles.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-white/35 uppercase mb-1">Artículos Legales</h4>
                        <div className="flex flex-wrap gap-1">
                          {charge.legal_articles.map((art, i) => (
                            <span key={i} className="text-xs bg-purple-900/30 text-purple-400 px-2 py-0.5 rounded">{art}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {charge.evidence_refs && charge.evidence_refs.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-white/35 uppercase mb-1">Evidencia</h4>
                        <ul className="text-sm text-white/60 space-y-1">
                          {charge.evidence_refs.map((ref, i) => (<li key={i} className="flex gap-2"><span className="text-green-400">•</span><span>{ref}</span></li>))}
                        </ul>
                      </div>
                    )}
                    {charge.missing_evidence && charge.missing_evidence.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-red-400 uppercase mb-1">⚠️ Evidencia Faltante</h4>
                        <ul className="text-sm text-white/60 space-y-1">
                          {charge.missing_evidence.map((m, i) => (<li key={i} className="flex gap-2"><span className="text-red-400">•</span><span>{m}</span></li>))}
                        </ul>
                      </div>
                    )}
                    {charge.ai_suggestions && charge.ai_suggestions.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-blue-400 uppercase mb-1">💡 Sugerencias</h4>
                        <ul className="text-sm text-white/60 space-y-1">
                          {charge.ai_suggestions.map((s, i) => (<li key={i} className="flex gap-2"><span className="text-blue-400">•</span><span>{s}</span></li>))}
                        </ul>
                      </div>
                    )}
                    {singleAnalysis[charge.id] && (
                      <div className="mt-3 p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
                        <h4 className="text-xs font-semibold text-blue-400 uppercase mb-2">🔍 Análisis Profundo</h4>
                        <p className="text-sm text-white/60 whitespace-pre-wrap">{String((singleAnalysis[charge.id])?.detailed_analysis || "")}</p>
                        {(singleAnalysis[charge.id]?.counter_arguments as string[] | undefined)?.length && (
                          <div className="mt-2">
                            <h5 className="text-xs font-semibold text-orange-400 mb-1">Posibles Contraargumentos:</h5>
                            <ul className="text-sm text-white/50 space-y-1">
                              {(singleAnalysis[charge.id]?.counter_arguments as string[]).map((ca: string, i: number) => (<li key={i}>⚡ {ca}</li>))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {charges.length > 0 && (
          <button onClick={analyzeAll} disabled={loading} className="w-full py-3 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {loading ? (<><span className="animate-spin">⚙️</span>Analizando {charges.length} cargos con Opus 4...</>) : (<>⚖️ Analizar Estrategia ({charges.length} cargos)</>)}
          </button>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-4">
          <div className={`rounded-lg border p-4 ${getStrengthColor(analysis.overall_strength)}`}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold">Fortaleza General del Caso</h2>
              <span className="text-2xl font-bold">{analysis.overall_strength}%</span>
            </div>
            <p className="text-sm opacity-80">{analysis.summary}</p>
          </div>

          {analysis.suggested_charges?.length > 0 && (
            <div className="bg-blue-900/20 rounded-lg border border-blue-500/20 p-4">
              <h3 className="text-sm font-semibold text-blue-400 mb-2">💡 Cargos Sugeridos por la IA</h3>
              <div className="space-y-2">
                {analysis.suggested_charges.map((s, i) => (
                  <div key={i} className="flex items-center justify-between bg-[#161619] rounded p-2 border border-white/[0.06]">
                    <div>
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded mr-2 ${s.type === 'cargo' ? 'bg-red-900/30 text-red-400' : 'bg-blue-900/30 text-blue-400'}`}>
                        {s.type.toUpperCase()}
                      </span>
                      <span className="font-medium text-sm text-white/70">{s.name}</span>
                      <span className="text-xs text-white/35 ml-2">({s.estimated_strength}%)</span>
                      <p className="text-xs text-white/45 mt-0.5 ml-1">{s.reason}</p>
                    </div>
                    <button onClick={() => addSuggested(s)} className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex-shrink-0">+ Agregar</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.weak_charges?.length > 0 && (
            <div className="bg-red-900/20 rounded-lg border border-red-500/20 p-4">
              <h3 className="text-sm font-semibold text-red-400 mb-2">❌ Cargos Difíciles de Defender</h3>
              <div className="space-y-2">
                {analysis.weak_charges.map((w, i) => (
                  <div key={i} className="text-sm">
                    <span className="font-medium text-red-400">{w.name}:</span>
                    <span className="text-white/50 ml-1">{w.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <a href={`/case/${caseData.slug}/adversarial`} className="flex-1 py-3 bg-purple-700 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors text-center">
              🎯 Pasar a Simulación Adversarial →
            </a>
          </div>
        </div>
      )}

      {charges.length === 0 && !analysis && (
        <div className="text-center py-12 text-white/25">
          <p className="text-4xl mb-3">⚖️</p>
          <p className="text-lg font-medium">Agregá cargos y pedidos cautelares</p>
          <p className="text-sm mt-1">Usá los presets o agregá los tuyos. La IA analizará la evidencia para cada uno.</p>
        </div>
      )}
    </div>
  )
}
