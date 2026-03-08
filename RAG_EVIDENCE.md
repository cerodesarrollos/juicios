# Task: Implement RAG for Case Evidence in Adversarial Simulation

## Context
The adversarial simulation currently dumps ALL chat messages to Claude, wasting tokens and losing context. 
We need RAG: embed all evidence, then search semantically per round.

## Architecture

### 1. New table: `case_evidence_chunks`
Matias will create this in Supabase SQL Editor. The app should handle it gracefully if it doesn't exist yet.

Schema:
```sql
CREATE TABLE case_evidence_chunks (
  id serial PRIMARY KEY,
  case_id text NOT NULL,
  source_table text NOT NULL, -- 'chat_evidence', 'transcriptions', 'evidence', 'timeline_events', 'transactions'
  source_id text NOT NULL,
  chapter integer,
  content text NOT NULL,
  metadata jsonb DEFAULT '{}',
  embedding vector(1536),
  created_at timestamptz DEFAULT now()
);
```

### 2. API Route: `/api/embed-evidence/route.ts`
POST endpoint that:
1. Reads ALL evidence for a case from: chat_evidence (chapters 1-5), transcriptions, evidence, timeline_events, transactions
2. Chunks the content (each message = 1 chunk, long transcriptions split into ~500 word chunks)
3. Generates embeddings using OpenAI text-embedding-3-small
4. Upserts into case_evidence_chunks
5. Returns count of chunks embedded

OpenAI key: use process.env.OPENAI_API_KEY
Create `src/lib/openai.ts`:
```typescript
import OpenAI from 'openai'
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
```

Install: `npm install openai`

### 3. Search function in API
Create `src/lib/evidence-search.ts`:
```typescript
export async function searchEvidence(caseId: string, query: string, limit = 30): Promise<EvidenceChunk[]> {
  // 1. Generate embedding for query using OpenAI
  // 2. Call Supabase RPC function to search by cosine similarity
  // 3. Return top N results with content and metadata
}
```

For the RPC function, use supabaseServer to call a raw SQL query via `.rpc()`.
Matias will create the function:
```sql
CREATE OR REPLACE FUNCTION search_evidence(query_embedding vector(1536), match_case_id text, match_count int DEFAULT 30)
RETURNS TABLE (id int, content text, source_table text, chapter int, metadata jsonb, similarity float)
AS $$
  SELECT id, content, source_table, chapter, metadata, 
    1 - (embedding <=> query_embedding) as similarity
  FROM case_evidence_chunks
  WHERE case_id = match_case_id
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$ LANGUAGE sql;
```

### 4. Update Adversarial API Route
Modify `src/app/api/adversarial/route.ts`:

**On `init`:**
1. Check if evidence is embedded (query case_evidence_chunks count)
2. If not embedded, return error suggesting to embed first
3. Search evidence with query: case description + "compraventa vehiculo deuda" 
4. Send top 30 chunks to Claude instead of all raw messages
5. Include case summary (from cases table) for context

**On `auto`:**
1. Take the last round's arguments as search query
2. Search evidence relevant to those arguments
3. Generate next round with relevant context

**On `counter`:**
1. Use user's input as search query
2. Find relevant evidence
3. Generate defense counterargument

**On `evaluate`:**
1. Search broadly for all key topics
2. Send comprehensive context

**System prompt changes:**
Instead of dumping all messages, format as:
```
EVIDENCIA RELEVANTE (encontrada por búsqueda semántica):
1. [Cap.2, chat_evidence] "Gordo estás necesitando un Auto?" - Toro a Chaves, 15/03/2024
2. [Transcripción, audio_001] "...le dije que le vendía el Audi TT..." 
3. [Timeline] 20/03/2024 - Transferencia USDT por $3,000
...
```

### 5. UI: Add "Preparar Evidencia" button
In AdversarialPage.tsx:
- Before "Iniciar Simulación", check if evidence is embedded
- If not, show "Preparar Evidencia" button that calls `/api/embed-evidence`
- Show progress: "Procesando X/Y fragmentos..."
- Once done, enable "Iniciar Simulación"

### 6. Important
- Keep the model selector working
- Use `process.env.OPENAI_API_KEY` for embeddings (NOT hardcoded)
- Spanish language throughout UI
- Handle errors gracefully - if embedding table doesn't exist, fall back to current behavior
- Don't break existing functionality

### 7. When done
```bash
git add -A && git commit -m "feat: RAG for evidence - semantic search instead of raw dump" && git push origin main
```
