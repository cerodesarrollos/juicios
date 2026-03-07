# UPGRADE — Juicios v2: Full CRUD + Multi-Case System

## Overview
Transform from a read-only single-case viewer into a full multi-case legal management system.

## Architecture Changes

### 1. HOME PAGE (/) — Case List
- Grid of case cards (like project cards in the reference UI)
- Each card shows: title, status badge, plaintiff vs defendant, total debt, % evidence complete, last updated
- "+ Nuevo Caso" button opens a modal/form
- Click card → /case/[slug] (case detail page)

### 2. CASE DETAIL PAGE (/case/[slug]) — Main Hub
- Top: case header with title, parties, status, debt summary
- Tabs or sub-navigation: Transacciones | Evidencia | Partes | Timeline | Configuración
- This is where all the current pages live, but SCOPED to this case

### 3. SIDEBAR — Context-Aware
- Always visible items: Inicio, Todos los Casos
- When inside a case: show case name + sub-menu (Transacciones, Evidencia, Partes, Timeline)
- Bottom: settings, help

### 4. FULL CRUD — Every Entity

#### Cases
- Create: modal form (title, plaintiff, defendant, debt amount, description)
- Edit: inline or modal
- Delete: with confirmation
- Status change: dropdown (activo/cerrado/archivado/ganado/perdido)

#### Transactions
- Create: form with fields (date, type, from, to, amount, method, concept, phase)
- proof_id auto-generated (P-XXX based on count)
- Edit: click to edit inline or modal
- Delete: with confirmation
- Reorder: sort_order drag or manual

#### Parties
- Create: form (name, CUIL, DNI, role, relationship, phone, notes)
- Edit/Delete
- Link to bank accounts

#### Evidence
- **UPLOAD**: drag & drop zone on each transaction's evidence slots
- Click a slot → file picker or drag & drop
- Upload goes to Supabase Storage: case-files/{case_slug}/{proof_id}/{slot_type}/{filename}
- Preview: image thumbnail, PDF icon, audio player
- Status auto-updates to 'adjuntado' on upload
- Can also upload standalone evidence (not linked to transaction)

#### Transcriptions
- Auto-generate from uploaded audio (call Whisper API server-side)
- Or manual text entry
- Display alongside audio player in split view

### 5. AUDIO PLAYER
- Inline player for .opus/.ogg/.mp3 files
- Play/pause, seek bar, playback speed (0.5x, 1x, 1.5x, 2x)
- Duration display
- Transcription text displayed below/beside with timestamps if available

### 6. SEARCH & FILTERS
- Global search bar in header (searches across proof_id, concept, party names, dates)
- Transaction filters: phase, type, status, direction, date range, party
- Evidence filters: type, status, source
- Parties filter: role

### 7. EXPORT PDF
- Button on case page: "Exportar Índice de Pruebas"
- Generates a PDF with:
  - Case header (parties, dates, debt)
  - Numbered list of all transactions with proof_id
  - Evidence status per transaction
  - Summary statistics
- Use browser print CSS or a library like html2pdf/jspdf

### 8. SHAREABLE LINK
- Generate a read-only link with a token for the lawyer
- /shared/[token] — shows case read-only, no edit, no sidebar
- Token stored in a new table: shared_links (case_id, token, expires_at, created_by)

### 9. ACTIVITY LOG
- New table: activity_log (case_id, action, entity_type, entity_id, description, created_at)
- Show recent activity on case dashboard
- Auto-log: evidence uploaded, transaction created, party added, etc.

## API Routes Needed (Next.js API routes with service role)

POST /api/cases — create case
PUT /api/cases/[id] — update case
DELETE /api/cases/[id] — delete case

POST /api/transactions — create transaction
PUT /api/transactions/[id] — update
DELETE /api/transactions/[id] — delete

POST /api/parties — create party
PUT /api/parties/[id] — update
DELETE /api/parties/[id] — delete

POST /api/evidence — create evidence record
PUT /api/evidence/[id] — update
DELETE /api/evidence/[id] — delete

POST /api/upload — upload file to Supabase Storage, create/update evidence record
POST /api/transcribe — transcribe audio file (call Whisper)

POST /api/shared-links — generate shareable link
GET /api/shared/[token] — get case data for shared view

## New DB Table

CREATE TABLE shared_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

## UI Components Needed

- CaseCard — card for case list
- CaseForm — create/edit case modal
- TransactionForm — create/edit transaction modal
- PartyForm — create/edit party modal
- EvidenceUploader — drag & drop upload component per slot
- AudioPlayer — inline audio player with controls
- TranscriptionView — text display with optional timestamps
- SearchBar — global search in header
- FilterBar — filter pills/dropdowns for lists
- ConfirmDialog — delete confirmation modal
- StatusBadge — reusable colored badge
- PDFExport — export button + generation
- SharedView — read-only case view for lawyers
- ActivityFeed — recent activity list

## Style Guide (keep current light theme)
- White cards, rounded-2xl, border gray-200
- Dark green (green-800) primary accent
- Light gray (gray-100) background
- Inter font
- Responsive (mobile-friendly)
- All forms in modals with backdrop blur

## File Upload Path Convention
case-files/{case_slug}/{proof_id}/{slot}/{filename}
Example: case-files/caso-toro/P-007/comprobante/transferencia-macro.jpg

## Build Requirements
- npm run build MUST pass with zero errors
- All pages must work with real Supabase data
- Commit everything when done

When completely finished, run: openclaw system event --text "Done: Juicios v2 complete" --mode now
