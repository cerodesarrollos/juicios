import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { generateEmbedding } from '@/lib/evidence-search'

interface ChunkData {
  case_id: string
  source_table: string
  source_id: string
  chapter: number | null
  content: string
  metadata: Record<string, unknown>
  embedding: number[]
}

function chunkText(text: string, maxWords = 500): string[] {
  const words = text.split(/\s+/)
  if (words.length <= maxWords) return [text]

  const chunks: string[] = []
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(' '))
  }
  return chunks
}

export async function POST(req: NextRequest) {
  try {
    const { case_id } = await req.json()
    if (!case_id) {
      return NextResponse.json({ error: 'case_id es requerido' }, { status: 400 })
    }

    // Check if table exists by attempting a query
    const tableCheck = await supabaseServer
      .from('case_evidence_chunks')
      .select('id', { count: 'exact', head: true })
      .eq('case_id', case_id)

    if (tableCheck.error && tableCheck.error.code === '42P01') {
      return NextResponse.json({ error: 'La tabla case_evidence_chunks no existe todavía. Pide a Matias que la cree.' }, { status: 400 })
    }

    // Delete existing chunks for this case (re-embed)
    await supabaseServer
      .from('case_evidence_chunks')
      .delete()
      .eq('case_id', case_id)

    const chunks: ChunkData[] = []

    // 1. Chat evidence (chapters 1-5)
    const { data: chatEvidence } = await supabaseServer
      .from('chat_evidence')
      .select('*')
      .eq('case_id', case_id)
      .gte('chapter', 1)
      .lte('chapter', 5)
      .order('chapter,sort_order')
      .range(0, 4999)

    for (const ce of chatEvidence ?? []) {
      const text = ce.message_text || ce.transcription || ce.file_name || ''
      if (!text.trim()) continue
      const content = `${ce.sender} (${ce.message_date}): ${text}${ce.is_key_evidence ? ' [EVIDENCIA CLAVE]' : ''}${ce.is_weak_point ? ` [PUNTO DÉBIL: ${ce.weak_point_note}]` : ''}`
      chunks.push({
        case_id,
        source_table: 'chat_evidence',
        source_id: ce.id,
        chapter: ce.chapter,
        content,
        metadata: { sender: ce.sender, date: ce.message_date, is_key: ce.is_key_evidence, is_weak: ce.is_weak_point },
        embedding: [],
      })
    }

    // 2. Transcriptions
    const { data: transcriptions } = await supabaseServer
      .from('transcriptions')
      .select('*')
      .eq('case_id', case_id)

    for (const t of transcriptions ?? []) {
      if (!t.text?.trim()) continue
      const textChunks = chunkText(t.text)
      for (let i = 0; i < textChunks.length; i++) {
        chunks.push({
          case_id,
          source_table: 'transcriptions',
          source_id: t.id,
          chapter: null,
          content: `Transcripción (evidencia ${t.evidence_id})${textChunks.length > 1 ? ` [parte ${i + 1}/${textChunks.length}]` : ''}: ${textChunks[i]}`,
          metadata: { evidence_id: t.evidence_id, part: i + 1, total_parts: textChunks.length },
          embedding: [],
        })
      }
    }

    // 3. Evidence
    const { data: evidence } = await supabaseServer
      .from('evidence')
      .select('*')
      .eq('case_id', case_id)

    for (const e of evidence ?? []) {
      const content = `[${e.evidence_type}] ${e.title}: ${e.description ?? 'Sin descripción'}`
      chunks.push({
        case_id,
        source_table: 'evidence',
        source_id: e.id,
        chapter: null,
        content,
        metadata: { type: e.evidence_type, title: e.title },
        embedding: [],
      })
    }

    // 4. Timeline events
    const { data: timeline } = await supabaseServer
      .from('timeline_events')
      .select('*')
      .eq('case_id', case_id)
      .order('date')

    for (const t of timeline ?? []) {
      const content = `${t.date} [${t.type}]: ${t.title}${t.description ? ' — ' + t.description : ''}`
      chunks.push({
        case_id,
        source_table: 'timeline_events',
        source_id: t.id,
        chapter: null,
        content,
        metadata: { date: t.date, type: t.type },
        embedding: [],
      })
    }

    // 5. Transactions
    const { data: transactions } = await supabaseServer
      .from('transactions')
      .select('*')
      .eq('case_id', case_id)
      .order('date')

    for (const t of transactions ?? []) {
      const content = `${t.date} | ${t.type ?? 'pago'} | ${t.currency ?? 'USD'} ${t.amount} | ${t.description ?? t.concept ?? 'Sin concepto'}`
      chunks.push({
        case_id,
        source_table: 'transactions',
        source_id: t.id,
        chapter: null,
        content,
        metadata: { date: t.date, type: t.type, amount: t.amount },
        embedding: [],
      })
    }

    if (chunks.length === 0) {
      return NextResponse.json({ count: 0, message: 'No se encontró evidencia para embeber.' })
    }

    // Generate embeddings in batches of 100
    const BATCH_SIZE = 100
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE)
      const texts = batch.map((c) => c.content)

      const response = await openai_embedBatch(texts)
      for (let j = 0; j < batch.length; j++) {
        batch[j].embedding = response[j]
      }
    }

    // Upsert into Supabase in batches
    const INSERT_BATCH = 50
    for (let i = 0; i < chunks.length; i += INSERT_BATCH) {
      const batch = chunks.slice(i, i + INSERT_BATCH)
      const { error } = await supabaseServer
        .from('case_evidence_chunks')
        .insert(batch)

      if (error) {
        console.error('Insert error:', error)
        return NextResponse.json({ error: `Error al insertar chunks: ${error.message}` }, { status: 500 })
      }
    }

    return NextResponse.json({ count: chunks.length, message: `${chunks.length} fragmentos de evidencia procesados.` })
  } catch (error) {
    console.error('Embed evidence error:', error)
    const message = error instanceof Error ? error.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function openai_embedBatch(texts: string[]): Promise<number[][]> {
  const { default: OpenAI } = await import('openai')
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
  })

  return response.data.map((d) => d.embedding)
}
