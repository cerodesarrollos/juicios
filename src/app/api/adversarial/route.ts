import { NextRequest, NextResponse } from 'next/server'
import { AdversarialRound, AdversarialSession } from '@/lib/types'
import { anthropic } from '@/lib/anthropic'
import { supabaseServer } from '@/lib/supabase-server'

const MODEL = 'claude-opus-4-0-20250514'

async function fetchCaseContext(caseId: string) {
  const caseResult = await supabaseServer.from('cases').select('*').eq('id', caseId).single()
  if (caseResult.error) throw new Error(\`Error al cargar caso: \${caseResult.error.message}\`)

  let evidence: Record<string, unknown>[] = []
  let chatEvidence: Record<string, unknown>[] = []

  try {
    const evidenceResult = await supabaseServer.from('evidence').select('*').eq('case_id', caseId)
    evidence = evidenceResult.data ?? []
  } catch { /* table may not exist */ }

  try {
    const chatEvidenceResult = await supabaseServer.from('chat_evidence').select('*').eq('case_id', caseId).order('sort_order')
    chatEvidence = chatEvidenceResult.data ?? []
  } catch { /* table may not exist */ }

  return {
    caseData: caseResult.data,
    evidence,
    chatEvidence,
  }
}

function buildSystemPrompt(caseData: Record<string, unknown>, evidence: Record<string, unknown>[], chatEvidence: Record<string, unknown>[]) {
  const evidenceSummary = evidence
    .map((e) => `- [${e.evidence_type}] ${e.title}: ${e.description ?? 'Sin descripción'}`)
    .join('\n')

  const chatSummary = chatEvidence
    .slice(0, 50)
    .map((ce) => `- Cap.${ce.chapter} (${ce.sender}, ${ce.message_date}): ${ce.message_text ?? ce.file_name ?? 'archivo'}${ce.is_key_evidence ? ' [EVIDENCIA CLAVE]' : ''}${ce.is_weak_point ? ` [PUNTO DÉBIL: ${ce.weak_point_note}]` : ''}`)
    .join('\n')

  return `Eres un experto analista legal argentino. Tu trabajo es generar simulaciones adversariales de alta calidad para casos legales.

CASO: ${caseData.title ?? 'Sin título'}
DESCRIPCIÓN: ${caseData.description ?? 'Sin descripción'}
TIPO: ${caseData.case_type ?? 'No especificado'}
ESTADO: ${caseData.status ?? 'No especificado'}

EVIDENCIA DISPONIBLE:
${evidenceSummary || 'No hay evidencia cargada.'}

MENSAJES/CHAT DE EVIDENCIA (primeros 50):
${chatSummary || 'No hay mensajes de chat.'}

REGLAS:
- Responde SIEMPRE en español
- Cita artículos REALES del Código Civil y Comercial de la Nación (CCyC) y del Código Penal argentino
- Las referencias a evidencia deben mencionar la evidencia REAL del caso listada arriba
- La defensa debe ser genuinamente fuerte — busca debilidades REALES en la acusación
- El puntaje de fuerza va de 1 a 10
- Responde SIEMPRE en formato JSON válido, sin markdown ni bloques de código`
}

function parseClaudeJSON(text: string): unknown {
  // Strip markdown code fences if present
  const cleaned = text.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim()
  return JSON.parse(cleaned)
}

async function generateRound(
  systemPrompt: string,
  userPrompt: string,
): Promise<AdversarialRound> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const parsed = parseClaudeJSON(text) as AdversarialRound
  return parsed
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { case_id, action, user_input } = body

  if (!case_id || !action) {
    return NextResponse.json({ error: 'case_id y action son requeridos' }, { status: 400 })
  }

  try {
    const { caseData, evidence, chatEvidence } = await fetchCaseContext(case_id)
    const systemPrompt = buildSystemPrompt(caseData, evidence, chatEvidence)

    if (action === 'init') {
      const round = await generateRound(systemPrompt, `Genera la Ronda 1 de la simulación adversarial para este caso. Analiza la evidencia disponible y genera argumentos de acusación y defensa.

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

      const previousContext = previousRounds
        ? `\n\nRONDAS ANTERIORES:\n${JSON.stringify(previousRounds, null, 2)}`
        : ''

      const round = await generateRound(systemPrompt, `Genera la Ronda ${roundNum} de la simulación adversarial.${previousContext}

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
      // Preserve the user's original argument
      round.prosecution.argument = user_input || 'Argumento manual del usuario.'
      return NextResponse.json({ round })
    }

    if (action === 'evaluate') {
      const rounds = body.previous_rounds as AdversarialRound[] | undefined

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
