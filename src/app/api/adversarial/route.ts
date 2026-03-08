import { NextRequest, NextResponse } from 'next/server'
import { AdversarialRound, AdversarialSession } from '@/lib/types'
import { anthropic } from '@/lib/anthropic'
import { supabaseServer } from '@/lib/supabase-server'
import { searchEvidence, getEmbeddedCount, formatEvidenceForPrompt } from '@/lib/evidence-search'

const DEFAULT_MODEL = 'claude-opus-4-20250514'

const AVAILABLE_MODELS: Record<string, string> = {
  'sonnet-4': 'claude-sonnet-4-20250514',
  'opus-4': 'claude-opus-4-20250514',
  'haiku-3.5': 'claude-3-5-haiku-20241022',
  'sonnet-3.5': 'claude-3-5-sonnet-20241022',
}

async function fetchCaseData(caseId: string) {
  const caseResult = await supabaseServer.from('cases').select('*').eq('id', caseId).single()
  if (caseResult.error) throw new Error(`Error al cargar caso: ${caseResult.error.message}`)
  return caseResult.data
}

// Fallback: fetch all evidence (used when RAG is not available)
async function fetchCaseContext(caseId: string) {
  const caseData = await fetchCaseData(caseId)

  let evidence: Record<string, unknown>[] = []
  let chatEvidence: Record<string, unknown>[] = []
  let transcriptions: Record<string, unknown>[] = []
  let timeline: Record<string, unknown>[] = []
  let transactions: Record<string, unknown>[] = []

  try {
    const r = await supabaseServer.from('evidence').select('*').eq('case_id', caseId)
    evidence = r.data ?? []
  } catch {}

  try {
    const result = await supabaseServer
      .from('chat_evidence')
      .select('*')
      .eq('case_id', caseId)
      .gte('chapter', 1)
      .lte('chapter', 5)
      .order('chapter,sort_order')
      .range(0, 4999)
    chatEvidence = result.data ?? []
  } catch {}

  try {
    const r = await supabaseServer.from('transcriptions').select('*').eq('case_id', caseId)
    transcriptions = r.data ?? []
  } catch {}

  try {
    const r = await supabaseServer.from('timeline_events').select('*').eq('case_id', caseId).order('date')
    timeline = r.data ?? []
  } catch {}

  try {
    const r = await supabaseServer.from('transactions').select('*').eq('case_id', caseId).order('date')
    transactions = r.data ?? []
  } catch {}

  return { caseData, evidence, chatEvidence, transcriptions, timeline, transactions }
}

function buildFallbackSystemPrompt(caseData: Record<string, unknown>, evidence: Record<string, unknown>[], chatEvidence: Record<string, unknown>[], transcriptions: Record<string, unknown>[] = [], timeline: Record<string, unknown>[] = [], transactions: Record<string, unknown>[] = []) {
  const evidenceSummary = evidence
    .map((e) => `- [${e.evidence_type}] ${e.title}: ${e.description ?? 'Sin descripción'}`)
    .join('\n')

  const keyEvidence = chatEvidence.filter((ce) => ce.is_key_evidence || ce.is_weak_point)
  const regularEvidence = chatEvidence.filter((ce) => !ce.is_key_evidence && !ce.is_weak_point)
  const orderedEvidence = [...keyEvidence, ...regularEvidence]

  const chatSummary = orderedEvidence
    .map((ce) => `- Cap.${ce.chapter} (${ce.sender}, ${ce.message_date}): ${ce.message_text ?? ce.transcription ?? ce.file_name ?? 'archivo'}${ce.is_key_evidence ? ' [EVIDENCIA CLAVE]' : ''}${ce.is_weak_point ? ` [PUNTO DÉBIL: ${ce.weak_point_note}]` : ''}`)
    .join('\n')

  const transcriptionSummary = transcriptions
    .map((t) => `- Transcripción (evidencia ${t.evidence_id}): ${(t.text as string)?.substring(0, 500) ?? 'Sin texto'}`)
    .join('\n')

  const timelineSummary = timeline
    .map((t) => `- ${t.date} [${t.type}]: ${t.title}${t.description ? ' — ' + t.description : ''}`)
    .join('\n')

  const transactionSummary = transactions
    .map((t) => `- ${t.date} | ${t.type ?? 'pago'} | ${t.currency ?? 'USD'} ${t.amount} | ${t.description ?? t.concept ?? 'Sin concepto'}`)
    .join('\n')

  return `Eres un experto analista legal argentino. Tu trabajo es generar simulaciones adversariales de alta calidad para casos legales.
PARTES DEL CASO:
- DEMANDANTE/ACUSACIÓN: ${caseData.plaintiff_name} (quien inicia la demanda)
- DEMANDADO/DEFENSA: ${caseData.defendant_name} (quien debe responder)

IDENTIFICACIÓN DE SENDERS EN LOS CHATS:
- El sender "Matias" o "Matías" = Matias Toro = DEMANDANTE
- El sender "Franco" = Franco Chaves = DEMANDADO  
- "Toro" es el APELLIDO del demandante (Matias Toro), pero TAMBIÉN es un apodo que ambos usan entre sí
- Para saber quién habla, mirá SIEMPRE el campo sender al inicio del mensaje, NO el contenido
- Ejemplo: "Matias (15/03/2024): che toro..." → habla MATIAS (demandante) dirigiéndose a Chaves
- Ejemplo: "Franco (15/03/2024): toro dame..." → habla FRANCO (demandado) dirigiéndose a Matias

REGLA CRÍTICA DE ATRIBUCIÓN:
- Cada mensaje tiene un EMISOR (sender). Prestá MÁXIMA atención a QUIÉN dice cada cosa.
- Si ${caseData.plaintiff_name} dice "no me das información" → es el DEMANDANTE reclamando al demandado
- Si ${caseData.defendant_name} dice "no me das información" → es el DEMANDADO reclamando al demandante  
- NUNCA confundir quién dijo qué. El sender al inicio de cada mensaje indica quién habla.
- Los mensajes tienen formato: "NOMBRE (fecha): texto"


CASO: ${caseData.title ?? 'Sin título'}
DESCRIPCIÓN: ${caseData.description ?? 'Sin descripción'}
TIPO: ${caseData.case_type ?? 'No especificado'}
ESTADO: ${caseData.status ?? 'No especificado'}

EVIDENCIA DISPONIBLE:
${evidenceSummary || 'No hay evidencia cargada.'}

MENSAJES/CHAT DE EVIDENCIA:
${chatSummary || 'No hay mensajes de chat.'}

TRANSCRIPCIONES DE AUDIOS/VIDEOS:
${transcriptionSummary || 'No hay transcripciones.'}

CRONOLOGÍA DE HECHOS:
${timelineSummary || 'No hay eventos en la cronología.'}

TRANSACCIONES/TRANSFERENCIAS:
${transactionSummary || 'No hay transacciones registradas.'}

REGLAS:
- Responde SIEMPRE en español
- Cita artículos REALES del Código Civil y Comercial de la Nación (CCyC) y del Código Penal argentino
- Las referencias a evidencia deben mencionar la evidencia REAL del caso listada arriba
- La defensa debe ser genuinamente fuerte — busca debilidades REALES en la acusación
- El puntaje de fuerza va de 1 a 10
- Responde SIEMPRE en formato JSON válido, sin markdown ni bloques de código`
}

function buildRAGSystemPrompt(caseData: Record<string, unknown>, relevantEvidence: string) {
  return `Eres un experto analista legal argentino. Tu trabajo es generar simulaciones adversariales de alta calidad para casos legales.
PARTES DEL CASO:
- DEMANDANTE/ACUSACIÓN: ${caseData.plaintiff_name} (quien inicia la demanda)
- DEMANDADO/DEFENSA: ${caseData.defendant_name} (quien debe responder)

REGLA CRÍTICA DE ATRIBUCIÓN:
- Cada mensaje tiene un EMISOR (sender). Prestá MÁXIMA atención a QUIÉN dice cada cosa.
- Si ${caseData.plaintiff_name} dice "no me das información" → es el DEMANDANTE reclamando al demandado
- Si ${caseData.defendant_name} dice "no me das información" → es el DEMANDADO reclamando al demandante  
- NUNCA confundir quién dijo qué. El sender al inicio de cada mensaje indica quién habla.
- Los mensajes tienen formato: "NOMBRE (fecha): texto"


CASO: ${caseData.title ?? 'Sin título'}
DESCRIPCIÓN: ${caseData.description ?? 'Sin descripción'}
TIPO: ${caseData.case_type ?? 'No especificado'}
ESTADO: ${caseData.status ?? 'No especificado'}

EVIDENCIA RELEVANTE (encontrada por búsqueda semántica):
${relevantEvidence}

REGLAS:
- Responde SIEMPRE en español
- Cita artículos REALES del Código Civil y Comercial de la Nación (CCyC) y del Código Penal argentino
- Las referencias a evidencia deben mencionar la evidencia REAL del caso listada arriba
- La defensa debe ser genuinamente fuerte — busca debilidades REALES en la acusación
- El puntaje de fuerza va de 1 a 10
- Responde SIEMPRE en formato JSON válido, sin markdown ni bloques de código`
}

function parseClaudeJSON(text: string): unknown {
  const cleaned = text.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim()
  return JSON.parse(cleaned)
}

async function generateRound(model: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<AdversarialRound> {
  const response = await anthropic.messages.create({
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const parsed = parseClaudeJSON(text) as AdversarialRound
  return parsed
}

async function getSystemPrompt(caseId: string, searchQuery: string): Promise<{ systemPrompt: string; useRAG: boolean }> {
  // Check if RAG is available
  const embeddedCount = await getEmbeddedCount(caseId)

  if (embeddedCount > 0) {
    const caseData = await fetchCaseData(caseId)
    const chunks = await searchEvidence(caseId, searchQuery, 30)
    const relevantEvidence = formatEvidenceForPrompt(chunks)
    return { systemPrompt: buildRAGSystemPrompt(caseData, relevantEvidence), useRAG: true }
  }

  // Fallback to full context dump
  const { caseData, evidence, chatEvidence, transcriptions, timeline, transactions } = await fetchCaseContext(caseId)
  return { systemPrompt: buildFallbackSystemPrompt(caseData, evidence, chatEvidence, transcriptions, timeline, transactions), useRAG: false }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { case_id, action, user_input, model: modelKey } = body
  const MODEL = AVAILABLE_MODELS[modelKey as string] || DEFAULT_MODEL

  if (!case_id || !action) {
    return NextResponse.json({ error: 'case_id y action son requeridos' }, { status: 400 })
  }

  try {
    if (action === 'check-embedded') {
      const count = await getEmbeddedCount(case_id)
      return NextResponse.json({ count })
    }

    if (action === 'init') {
      // For init, search broadly with case description
      const caseData = await fetchCaseData(case_id)
      const initQuery = `${caseData.description ?? ''} compraventa vehiculo deuda`
      const { systemPrompt } = await getSystemPrompt(case_id, initQuery)

      const round = await generateRound(MODEL, systemPrompt, `Genera la Ronda 1 de la simulación adversarial para este caso. Analiza la evidencia disponible y genera argumentos de acusación y defensa.

Responde en este formato JSON exacto:
{
  "number": 1,
  "prosecution": {
    "argument": "argumento detallado de la acusación citando evidencia real del caso",
    "evidence_refs": ["referencias a evidencia real del caso"],
    "legal_articles": ["Art. X CCyC - descripción breve"],
    "strength": 8
  },
  "defense": {
    "counterargument": "contraargumento detallado de la defensa",
    "evidence_refs": ["referencias a evidencia o falta de ella"],
    "legal_articles": ["Art. X CCyC - descripción breve"],
    "strength": 6
  },
  "round_winner": "prosecution"
}`)

      round.number = 1

      const session: AdversarialSession = {
        id: crypto.randomUUID(),
        case_id,
        rounds: [round],
        overall_score: {
          prosecution: round.prosecution.strength,
          defense: round.defense.strength,
          unresolved_points: 2,
          resolved_points: 1,
        },
        status: 'active',
      }
      return NextResponse.json(session)
    }

    if (action === 'auto') {
      const previousRounds = body.previous_rounds as AdversarialRound[] | undefined
      const roundNum = (body.current_rounds ?? 0) + 1

      // Use last round's arguments as search query
      const lastRound = previousRounds?.[previousRounds.length - 1]
      const searchQuery = lastRound
        ? `${lastRound.prosecution.argument.substring(0, 200)} ${lastRound.defense.counterargument.substring(0, 200)}`
        : 'evidencia caso'
      const { systemPrompt } = await getSystemPrompt(case_id, searchQuery)

      const previousContext = previousRounds
        ? `\n\nRONDAS ANTERIORES:\n${JSON.stringify(previousRounds, null, 2)}`
        : ''

      const round = await generateRound(MODEL, systemPrompt, `Genera la Ronda ${roundNum} de la simulación adversarial.${previousContext}

Construye sobre las rondas anteriores. Introduce nuevos argumentos, no repitas los anteriores. Cada lado debe intentar superar los puntos del otro.

Responde en este formato JSON exacto:
{
  "number": ${roundNum},
  "prosecution": {
    "argument": "nuevo argumento que avanza la posición acusatoria",
    "evidence_refs": ["referencias a evidencia"],
    "legal_articles": ["Art. X CCyC - descripción"],
    "strength": 7
  },
  "defense": {
    "counterargument": "nuevo contraargumento que avanza la defensa",
    "evidence_refs": ["referencias a evidencia"],
    "legal_articles": ["Art. X CCyC - descripción"],
    "strength": 7
  },
  "round_winner": "prosecution" | "defense" | "draw"
}`)

      round.number = roundNum
      return NextResponse.json({ round })
    }

    if (action === 'counter') {
      const roundNum = (body.current_rounds ?? 0) + 1
      const previousRounds = body.previous_rounds as AdversarialRound[] | undefined

      // Use user's input as search query
      const { systemPrompt } = await getSystemPrompt(case_id, user_input || 'evidencia caso')

      const previousContext = previousRounds
        ? `\n\nRONDAS ANTERIORES:\n${JSON.stringify(previousRounds, null, 2)}`
        : ''

      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `El usuario ha presentado el siguiente argumento de acusación:

"${user_input}"
${previousContext}

Genera ÚNICAMENTE el contraargumento de la defensa. Debe ser un contraargumento fuerte y bien fundamentado que busque debilidades reales en el argumento presentado.

Responde en este formato JSON exacto:
{
  "number": ${roundNum},
  "prosecution": {
    "argument": "${user_input?.replace(/"/g, '\\"') ?? ''}",
    "evidence_refs": [],
    "legal_articles": [],
    "strength": 6
  },
  "defense": {
    "counterargument": "contraargumento fuerte y detallado",
    "evidence_refs": ["referencias a evidencia"],
    "legal_articles": ["Art. X CCyC - descripción"],
    "strength": 7
  },
  "round_winner": "defense" | "prosecution" | "draw"
}`,
        }],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      const round = parseClaudeJSON(text) as AdversarialRound
      round.number = roundNum
      round.prosecution.argument = user_input || 'Argumento manual del usuario.'
      return NextResponse.json({ round })
    }

    
    if (action === 'build') {
      // User writes a rough argument idea, AI builds a proper prosecution argument with evidence
      const searchResults = await searchEvidence(case_id, user_input || '', 40)
      const evidenceContext = formatEvidenceForPrompt(searchResults)

      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 4096,
        system: ragSystemPrompt,
        messages: [{
          role: 'user',
          content: `El abogado del DEMANDANTE quiere construir el siguiente argumento:

"${user_input}"

EVIDENCIA RELEVANTE ENCONTRADA:
${evidenceContext}

Tu trabajo: Tomá esa idea y convertila en un ARGUMENTO LEGAL SÓLIDO para la acusación.
- Mejorá la redacción legal
- Citá evidencia ESPECÍFICA del caso (con sender correcto, fecha, texto exacto)
- Citá artículos legales argentinos aplicables
- Hacé que sea contundente e irrefutable
- Después generá el MEJOR contraargumento posible de la defensa

Responde en JSON:
{
  "number": 0,
  "prosecution": {
    "argument": "argumento legal mejorado y fundamentado",
    "evidence_refs": ["evidencia citada"],
    "legal_articles": ["Art. X CCyC - descripción"],
    "strength": 8
  },
  "defense": {
    "counterargument": "mejor contraargumento posible",
    "evidence_refs": ["evidencia citada"],
    "legal_articles": ["Art. X CCyC - descripción"],
    "strength": 6
  },
  "round_winner": "prosecution"
}`
        }],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      const round = parseClaudeJSON(text) as AdversarialRound
      round.number = (body.current_rounds ?? 0) + 1
      return NextResponse.json({ round })
    }

if (action === 'evaluate') {
      const rounds = body.previous_rounds as AdversarialRound[] | undefined

      // Search broadly for evaluation
      const allArguments = (rounds ?? [])
        .map(r => `${r.prosecution.argument.substring(0, 100)} ${r.defense.counterargument.substring(0, 100)}`)
        .join(' ')
      const { systemPrompt } = await getSystemPrompt(case_id, allArguments || 'evaluación completa caso')

      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `Evalúa de forma comprehensiva la siguiente simulación adversarial:

RONDAS:
${JSON.stringify(rounds ?? [], null, 2)}

Analiza la fortaleza global de ambas posiciones y genera una evaluación completa.

Responde en este formato JSON exacto:
{
  "evaluation": {
    "overall_strength": 7.5,
    "prosecution_score": 8,
    "defense_score": 6,
    "summary": "resumen comprehensivo de la evaluación",
    "strong_points": ["punto fuerte 1", "punto fuerte 2"],
    "weak_points": ["punto débil 1", "punto débil 2"],
    "recommendation": "recomendación estratégica detallada"
  }
}`,
        }],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      const parsed = parseClaudeJSON(text) as { evaluation: unknown }
      return NextResponse.json(parsed)
    }

    return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 })
  } catch (error) {
    console.error('Adversarial API error:', error)
    const message = error instanceof Error ? error.message : 'Error interno del servidor'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
