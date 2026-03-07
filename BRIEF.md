# Juicios — Legal Case Management Dashboard

## Stack
- Next.js 14 (App Router)
- Supabase (DB + Storage)  
- Tailwind CSS
- No auth for now (service role key server-side)

## Supabase
- URL: https://ywokbfqjtdmhlwahdhhd.supabase.co
- Anon Key: sb_publishable_Y9GywGbQZhAaw-HyfS0Z5w_ZSDi3BSk
- Service Role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3b2tiZnFqdGRtaGx3YWhkaGhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjkxMTI5OCwiZXhwIjoyMDg4NDg3Mjk4fQ.95wEbVfkbMpg4UzJSOgvA-FxgD5izDkomsR6LB9gz2g
- Storage bucket: case-files (private)

## DB Schema (already created)
Tables: cases, parties, bank_accounts, transactions, evidence, transcriptions, chat_messages, timeline_events
View: case_summary

Key relationships:
- Everything has case_id → cases
- evidence has transaction_id → transactions (nullable)
- transcriptions has evidence_id → evidence
- transactions has from_party_id, to_party_id → parties
- transactions has proof_id (P-001, P-002, etc.)

## UI Design
Dark theme, green accent (#22c55e), similar to a legal dashboard.
Background: very dark (#0a0a0f), cards: (#12121a), borders: (#1e1e2e)

### Layout
- Left sidebar with navigation
- Top stats bar (total debt, evidence count, completion %)
- Main content area

### Pages
1. **Dashboard** (/) — Case overview with stats, recent activity, quick actions
2. **Transactions** (/transactions) — Full list with filters, expandable rows showing linked evidence
3. **Evidence** (/evidence) — Gallery/list view, upload functionality, status tracking per slot
4. **Parties** (/parties) — People involved, their accounts, linked transactions
5. **Timeline** (/timeline) — Chronological view of all events
6. **Case Detail** (/case/[slug]) — Everything about one case

### Key Features
- Upload files to Supabase Storage (drag & drop or click)
- Audio player inline for .opus/.ogg files
- Transcription display alongside audio
- Each transaction shows 4 evidence slots: comprobante, captura, audio, transcripcion
- Status badges: ✅ Adjuntado / ⏳ Pendiente / ❌ No existe
- Filter by phase, type, status, party
- Search by proof_id, date, concept
- Color coding: green=paid, red=breach, blue=service, yellow=agreement
- Responsive (mobile friendly)
- Print-friendly view for lawyer

### Data already loaded
- 1 case (caso-toro)
- 18 parties
- 39 transactions (P-001 to P-039)

## Environment Variables (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://ywokbfqjtdmhlwahdhhd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Y9GywGbQZhAaw-HyfS0Z5w_ZSDi3BSk
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3b2tiZnFqdGRtaGx3YWhkaGhkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjkxMTI5OCwiZXhwIjoyMDg4NDg3Mjk4fQ.95wEbVfkbMpg4UzJSOgvA-FxgD5izDkomsR6LB9gz2g

## Instructions
1. npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
2. Install @supabase/supabase-js
3. Build all pages and components
4. Make sure `npm run build` passes
5. Commit everything

When completely finished, run: openclaw system event --text "Done: Juicios dashboard built" --mode now
