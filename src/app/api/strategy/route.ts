import { NextRequest, NextResponse } from 'next/server'
import { anthropic } from '@/lib/anthropic'
import { supabaseServer } from '@/lib/supabase-server'
import { searchEvidence, formatEvidenceForPrompt } from '@/lib/evidence-search'

const MODEL = 'claude-opus-4-20250514'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { case_id, action, charges, charge } = body

    if (!case_id) {
      return NextResponse.json({ error: 'case_id requerido' }, { status: 400 })
    }

    const caseResult = await supabaseServer.from('cases').select('*').eq('id', case_id).single()
    if (caseResult.error) {
      return NextResponse.json({ error: 'Caso no encontrado' }, { status: 404 })
    }
    const caseData = caseResult.data

    // Fetch attorney context for this case
    const { data: attorneyContext } = await supabaseServer
      .from('evidence')
      .select('title, description, original_date')
      .eq('case_id', case_id)
      .eq('evidence_type', 'attorney_context')

    const attorneyNotes = (attorneyContext ?? [])
      .map(ac => `[${ac.original_date || 'Sin fecha'}] ${ac.title}: ${ac.description || ''}`)
      .join('\n')
    const attorneySection = attorneyNotes
      ? `\n\nNOTAS DEL ABOGADO:\n${attorneyNotes}`
      : ''

    if (action === 'analyze') {
      if (!charges || charges.length === 0) {
        return NextResponse.json({ error: 'Se requiere al menos un cargo' }, { status: 400 })
      }

      const chargeNames = charges.map((c: { name: string }) => c.name).join(', ')
      const searchResults = await searchEvidence(case_id, `${chargeNames} evidencia pruebas`, 60)
      const evidenceContext = formatEvidenceForPrompt(searchResults)

      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 8192,
        system: `Sos un abogado penalista argentino experto. Estás analizando un caso para armar la estrategia legal.

CASO: ${caseData.title}
DEMANDANTE: ${caseData.plaintiff_name}
DEMANDADO: ${caseData.defendant_name}
DESCRIPCIÓN: ${caseData.description || 'Sin descripción'}
DEUDA TOTAL USD: ${caseData.total_debt_usd}

Tu trabajo es analizar cada cargo/pedido cautelar propuesto y evaluar si la evidencia disponible lo sustenta.

IMPORTANTE:
- Sé HONESTO. Si un cargo no se puede sostener, decilo claramente.
- Citá evidencia ESPECÍFICA (con fecha, sender, texto exacto).
- Citá artículos del Código Penal, Procesal Penal, Civil y Comercial argentino.
- Evaluá fortaleza de 0 a 100.
- Sugerí cargos adicionales que veas viables con la evidencia.
- Señalá qué cargos son débiles y por qué.`,
        messages: [{
          role: 'user',
          content: `CARGOS/PEDIDOS CAUTELARES PROPUESTOS:
${charges.map((c: { name: string; type: string; description: string }, i: number) => `${i + 1}. [${c.type.toUpperCase()}] ${c.name}: ${c.description}`).join('\n')}

EVIDENCIA DISPONIBLE:
${evidenceContext}${attorneySection}

Analizá cada cargo contra la evidencia. Para cada uno evaluá:
1. ¿Se puede sostener? ¿Qué tan fuerte es?
2. ¿Qué evidencia específica lo respalda?
3. ¿Qué artículos legales aplican?
4. ¿Qué evidencia falta para fortalecerlo?
5. Sugerencias para mejorar el argumento

Además:
- ¿Hay otros cargos/cautelares que se podrían agregar basándose en la evidencia?
- ¿Hay cargos que NO se van a poder defender? ¿Por qué?

Responde SOLO en JSON válido con esta estructura:
{
  "charges": [
    {
      "id": "charge-1",
      "type": "cargo" | "cautelar",
      "name": "nombre del cargo",
      "description": "descripción",
      "status": "strong" | "weak" | "insufficient",
      "strength": 0-100,
      "evidence_refs": ["evidencia específica citada..."],
      "legal_articles": ["Art. X del Código Y..."],
      "ai_analysis": "análisis detallado",
      "ai_suggestions": ["sugerencia para fortalecer..."],
      "missing_evidence": ["evidencia que faltaría..."]
    }
  ],
  "suggested_charges": [
    {
      "name": "cargo sugerido",
      "type": "cargo" | "cautelar",
      "reason": "por qué se podría agregar",
      "estimated_strength": 0-100
    }
  ],
  "weak_charges": [
    {
      "name": "cargo débil",
      "reason": "por qué no se puede defender"
    }
  ],
  "overall_strength": 0-100,
  "summary": "resumen general de la estrategia"
}`
        }],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return NextResponse.json({ error: 'Error parseando respuesta de IA', raw: text }, { status: 500 })
      }

      try {
        const analysis = JSON.parse(jsonMatch[0])
        return NextResponse.json(analysis)
      } catch {
        return NextResponse.json({ error: 'JSON inválido de IA', raw: text }, { status: 500 })
      }
    }

    if (action === 'analyze-single') {
      if (!charge) {
        return NextResponse.json({ error: 'charge requerido' }, { status: 400 })
      }

      const searchResults = await searchEvidence(case_id, `${charge.name} ${charge.description} evidencia prueba`, 40)
      const evidenceContext = formatEvidenceForPrompt(searchResults)

      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 4096,
        system: `Sos un abogado penalista argentino. Analizá en profundidad este cargo/pedido cautelar para el caso ${caseData.title}. Demandante: ${caseData.plaintiff_name}, Demandado: ${caseData.defendant_name}.`,
        messages: [{
          role: 'user',
          content: `CARGO A ANALIZAR: [${charge.type}] ${charge.name}
Descripción: ${charge.description}

EVIDENCIA:
${evidenceContext}${attorneySection}

Hacé un análisis exhaustivo:
1. Viabilidad legal (artículos específicos)
2. Evidencia que lo sustenta (citas textuales)
3. Posibles contraargumentos de la defensa
4. Qué necesitarías para hacerlo irrefutable
5. Precedentes jurisprudenciales si aplica

Responde en JSON:
{
  "strength": 0-100,
  "status": "strong" | "weak" | "insufficient",
  "legal_basis": ["artículos..."],
  "supporting_evidence": ["evidencia con citas..."],
  "counter_arguments": ["posibles defensas..."],
  "missing_evidence": ["qué falta..."],
  "recommendations": ["cómo fortalecer..."],
  "detailed_analysis": "análisis narrativo completo"
}`
        }],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return NextResponse.json({ error: 'Error parseando', raw: text }, { status: 500 })
      }

      try {
        const analysis = JSON.parse(jsonMatch[0])
        return NextResponse.json(analysis)
      } catch {
        return NextResponse.json({ error: 'JSON inválido', raw: text }, { status: 500 })
      }
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    console.error('Strategy API error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
