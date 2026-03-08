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

export async function getEmbeddedCount(caseId: string): Promise<number> {
  const { count, error } = await supabaseServer
    .from('case_evidence_chunks')
    .select('*', { count: 'exact', head: true })
    .eq('case_id', caseId)

  if (error) return 0
  return count ?? 0
}

export function formatEvidenceForPrompt(chunks: EvidenceChunk[]): string {
  if (chunks.length === 0) return 'No se encontró evidencia relevante.'

  return chunks
    .map((chunk, i) => {
      const source = chunk.source_table === 'chat_evidence'
        ? `Cap.${chunk.chapter}, chat`
        : chunk.source_table === 'transcriptions'
        ? 'Transcripción'
        : chunk.source_table === 'timeline_events'
        ? 'Timeline'
        : chunk.source_table === 'transactions'
        ? 'Transacción'
        : chunk.source_table
      return `${i + 1}. [${source}] ${chunk.content}`
    })
    .join('\n')
}
