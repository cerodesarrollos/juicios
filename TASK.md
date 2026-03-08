# Task: Upgrade Strategy Page + Evidence System

## Context
This is a legal case management system (Next.js 14, Tailwind 4, Supabase, Anthropic SDK).
The repo is at /tmp/juicios. Push to git when done.

## What to build

### 1. Attorney Context Section in Strategy Page (`src/app/case/[slug]/strategy/StrategyPage.tsx`)

Add a section ABOVE the charges list where the attorney can:
- Write free-form context/notes about the case (textarea)
- Upload files (PDFs, images) that get stored as evidence
- Each context entry has: text, optional attachments, timestamp
- This context gets sent to the AI along with RAG results when analyzing charges
- The context should be stored in Supabase table `attorney_context` (create via API)

The upload flow:
- File goes to Supabase Storage bucket `case-files`
- A record is created in the `evidence` table with evidence_type='attorney_context'
- Text context is also stored

### 2. Video Evidence Upload (`src/app/api/evidence-upload/route.ts` - new)

Create an API route + UI component for uploading video evidence metadata:
- Fields: title, description (what's seen in the video), date, location, source (e.g. "Instagram"), link/URL
- This creates a record in `evidence` table with evidence_type='video'
- The description text gets embedded (will be picked up by existing embed-evidence flow)

Add this as a section in the Strategy page too - "Agregar Evidencia de Video"

### 3. Fix the embed-evidence route (`src/app/api/embed-evidence/route.ts`)

The PDF parsing uses `pdf-parse` with wrong import syntax. Fix it:
- The import `const { PDFParse } = await import('pdf-parse')` is wrong
- Use: `const pdfParse = (await import('pdf-parse')).default; const result = await pdfParse(Buffer.from(pdfBuffer))`
- pdf-parse returns `{ text, numpages, info }` directly
- Remove the `.getText()` and `.destroy()` calls
- Also add a new source_table type 'attorney_context' to embed attorney context entries

### 4. Update the Strategy API (`src/app/api/strategy/route.ts`)

When analyzing charges, also fetch attorney_context:
- Query evidence table for evidence_type='attorney_context' for this case
- Include the attorney's notes in the prompt alongside RAG results
- This ensures the AI considers what the attorney wrote manually

### 5. Re-embed button in Strategy page

Add a button "🔄 Re-embeddear Evidencia" that calls the existing `/api/embed-evidence` endpoint.
Show the count of embedded chunks. This way after adding new evidence (videos, context, PDFs), the attorney can re-embed everything without leaving the page.

## Technical Notes

- Supabase client: `import { supabaseServer } from '@/lib/supabase-server'`
- Anthropic client: `import { anthropic } from '@/lib/anthropic'`
- Evidence search: `import { searchEvidence, formatEvidenceForPrompt, generateEmbedding } from '@/lib/evidence-search'`
- Existing types in `src/lib/types.ts`
- The `case_evidence_chunks` table has: id, case_id, source_table, source_id, chapter, content, metadata (jsonb), embedding (vector)
- The `evidence` table already exists with fields: id, case_id, evidence_type, title, description, file_path, file_url, file_type, etc.
- For new tables, use the Supabase REST API to create them OR just use the evidence table with new evidence_type values

## Style
- Match existing UI style: green-700 primary, rounded-lg borders, text-sm, gray-200 borders
- Use Tailwind classes matching the rest of the app
- TypeScript strict mode

## Git
When done, commit all changes with a descriptive message and `git push`.
PAT is already configured in the remote URL.
