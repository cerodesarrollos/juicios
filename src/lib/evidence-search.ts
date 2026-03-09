import { openai } from '@/lib/openai'
import { supabaseServer } from '@/lib/supabase-server'

export interface EvidenceChunk {
  id: number
  content: string
  source_table: string
  chapter: number | null
  metadata: Record<string, unknown>
  similarity: number
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })
  return response.data[0].embedding
}

export async function searchEvidence(caseId: string, query: string, limit = 30): Promise<EvidenceChunk[]> {
  const embedding = await generateEmbedding(query)

  const { data, error } = await supabaseServer.rpc('search_evidence', {
    query_embedding: embedding,
    match_case_id: caseId,
    match_count: limit,
  })

  if (error) {
    console.error('Evidence search error:', error)
    return []
  }

  return (data ?? []) as EvidenceChunk[]
}

// ─── Context Window Types ───

export interface ContextMessage {
  id: string
  sender: string
  message_date: string
  message_text: string | null
  message_type: string
  sort_order: number
  is_key_evidence: boolean
  is_weak_point: boolean
  weak_point_note: string | null
  transcription: string | null
  file_name: string | null
  isMatch: boolean
}

export interface ContextBlock {
  chapter: number
  sortRange: [number, number]
  similarity: number
  messages: ContextMessage[]
}

/**
 * Search evidence with context window expansion.
 * For chat_evidence chunks that match, fetches ±contextWindow surrounding messages
 * to provide full conversation context instead of isolated messages.
 */
export async function searchEvidenceWithContext(
  caseId: string,
  query: string,
  limit = 20,
  contextWindow = 10
): Promise<{ chunks: EvidenceChunk[]; contextMessages: ContextBlock[] }> {
  const chunks = await searchEvidence(caseId, query, limit)

  // Separate chat vs non-chat
  const chatChunks = chunks.filter(c => c.source_table === 'chat_evidence')
  const nonChatChunks = chunks.filter(c => c.source_table !== 'chat_evidence')

  // For each chat chunk, find its sort_order via date lookup
  interface MatchInfo { chapter: number; sort_order: number; similarity: number }
  const matchInfos: MatchInfo[] = []

  for (const chunk of chatChunks) {
    const dateMatch = chunk.content.match(/\((\d{4}-\d{2}-\d{2}T[\d:+]+)\)/)
    if (!dateMatch) continue

    const { data } = await supabaseServer
      .from('chat_evidence')
      .select('sort_order, chapter')
      .eq('case_id', caseId)
      .eq('message_date', dateMatch[1])
      .limit(1)

    if (data?.[0]) {
      matchInfos.push({
        chapter: data[0].chapter,
        sort_order: data[0].sort_order,
        similarity: chunk.similarity,
      })
    }
  }

  // Merge overlapping ranges per chapter
  const rangesByChapter = new Map<number, { min: number; max: number; topSim: number; matchOrders: number[] }[]>()

  for (const m of matchInfos) {
    const ch = m.chapter
    const rMin = Math.max(1, m.sort_order - contextWindow)
    const rMax = m.sort_order + contextWindow

    if (!rangesByChapter.has(ch)) rangesByChapter.set(ch, [])
    const ranges = rangesByChapter.get(ch)!

    let merged = false
    for (const r of ranges) {
      // Merge if ranges overlap or are within 3 messages of each other
      if (rMin <= r.max + 3 && rMax >= r.min - 3) {
        r.min = Math.min(r.min, rMin)
        r.max = Math.max(r.max, rMax)
        r.topSim = Math.max(r.topSim, m.similarity)
        r.matchOrders.push(m.sort_order)
        merged = true
        break
      }
    }
    if (!merged) {
      ranges.push({ min: rMin, max: rMax, topSim: m.similarity, matchOrders: [m.sort_order] })
    }
  }

  // Fetch expanded context for each range
  const contextBlocks: ContextBlock[] = []

  for (const [chapter, ranges] of rangesByChapter) {
    for (const range of ranges) {
      const { data } = await supabaseServer
        .from('chat_evidence')
        .select('id, sender, message_date, message_text, message_type, sort_order, is_key_evidence, is_weak_point, weak_point_note, transcription, file_name')
        .eq('case_id', caseId)
        .eq('chapter', chapter)
        .gte('sort_order', range.min)
        .lte('sort_order', range.max)
        .order('sort_order')

      if (data && data.length > 0) {
        contextBlocks.push({
          chapter,
          sortRange: [range.min, range.max],
          similarity: range.topSim,
          messages: data.map(msg => ({
            ...msg,
            isMatch: range.matchOrders.includes(msg.sort_order),
          })),
        })
      }
    }
  }

  // Sort blocks by similarity (most relevant first)
  contextBlocks.sort((a, b) => b.similarity - a.similarity)

  return { chunks: nonChatChunks, contextMessages: contextBlocks }
}

/**
 * Format context-expanded evidence into a prompt string.
 * Messages that matched the search are highlighted with >>> markers.
 */
export function formatContextEvidenceForPrompt(
  nonChatChunks: EvidenceChunk[],
  contextBlocks: ContextBlock[]
): string {
  const parts: string[] = []

  for (const block of contextBlocks) {
    const matchCount = block.messages.filter(m => m.isMatch).length
    parts.push(`\n━━━ CONVERSACIÓN Cap.${block.chapter} (${matchCount} mensajes relevantes, similitud ${(block.similarity * 100).toFixed(0)}%) ━━━`)

    for (const msg of block.messages) {
      const prefix = msg.isMatch ? '>>> ' : '    '
      const flags: string[] = []
      if (msg.is_key_evidence) flags.push('[🔑 EVIDENCIA CLAVE]')
      if (msg.is_weak_point) flags.push(`[⚠️ PUNTO DÉBIL: ${msg.weak_point_note}]`)

      const content = msg.message_text || msg.transcription || (msg.file_name ? `[Archivo: ${msg.file_name}]` : '[archivo]')
      parts.push(`${prefix}${msg.sender} (${msg.message_date}): ${content}${flags.length ? ' ' + flags.join(' ') : ''}`)
    }
  }

  if (nonChatChunks.length > 0) {
    parts.push('\n━━━ OTRA EVIDENCIA ━━━')
    for (const chunk of nonChatChunks) {
      const source = chunk.source_table === 'transcriptions' ? 'Transcripción'
        : chunk.source_table === 'timeline_events' ? 'Timeline'
        : chunk.source_table === 'transactions' ? 'Transacción'
        : chunk.source_table === 'attorney_context' ? 'Nota del abogado'
        : chunk.source_table === 'evidence_pdf' ? 'PDF'
        : chunk.source_table
      parts.push(`[${source}] ${chunk.content}`)
    }
  }

  return parts.join('\n') || 'No se encontró evidencia relevante.'
}

export async function getEmbeddedCount(caseId: string): Promise<number> {
  const { count, error } = await supabaseServer
    .from('case_evidence_chunks')
    .select('*', { count: 'exact', head: true })
    .eq('case_id', caseId)

  if (error) return 0
  return count ?? 0
}

// Legacy format (backward compat)
export function formatEvidenceForPrompt(chunks: EvidenceChunk[]): string {
  if (chunks.length === 0) return 'No se encontró evidencia relevante.'

  return chunks
    .map((chunk, i) => {
      const source = chunk.source_table === 'chat_evidence'
        ? `Cap.${chunk.chapter}, chat`
        : chunk.source_table === 'transcriptions' ? 'Transcripción'
        : chunk.source_table === 'timeline_events' ? 'Timeline'
        : chunk.source_table === 'transactions' ? 'Transacción'
        : chunk.source_table === 'attorney_context' ? 'Nota del abogado'
        : chunk.source_table === 'evidence_video' ? 'Video'
        : chunk.source_table === 'evidence_pdf' ? 'PDF'
        : chunk.source_table
      return `${i + 1}. [${source}] ${chunk.content}`
    })
    .join('\n')
}
