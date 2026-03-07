# CHAT VIEW — WhatsApp-style evidence viewer

## New table: chat_evidence (already created in Supabase)
Columns: id, case_id, evidence_id (AUD-001, MSG-0001, IMG-001, VID-001), chapter (1-5), chapter_name, message_date, sender, message_type (text/audio/image/video/sticker/document/contact/location/deleted/system), message_text, file_name, transcription, is_key_evidence, is_weak_point, weak_point_note, notes, sort_order, created_at

3889 messages loaded for caso-toro.

## What to build

### New page: /case/[slug]/chat
Two-column layout:

**Left column (60% width):** WhatsApp-style chat view
- Messages in bubbles: green (right) for Matias, white (left) for Toro
- Date separators between days
- Audio messages: show play button + waveform placeholder + duration, with transcription text below in italic gray
- Image messages: thumbnail (placeholder icon for now since files aren't uploaded yet)
- Video messages: video icon placeholder
- Each message has its evidence_id shown as a small badge (e.g., "MSG-0042", "AUD-109")
- Deleted messages shown in gray italic
- Key evidence highlighted with yellow left border
- Weak points highlighted with red left border

**Right column (40% width):** Evidence detail panel
- Sticky panel that updates as you scroll or click a message
- Shows: evidence_id, type, date, sender, full text, transcription, linked transaction if any
- For audio: larger player with transcription
- For images: larger preview
- Tags: "Prueba clave" / "Punto débil" badges
- Notes field

### Sidebar navigation
Add to the case sidebar:
- 💬 Chat Completo (all messages)
- Chapter sub-items:
  - ① Relación comercial (1786 msgs)
  - ② Compraventa auto (352 msgs)
  - ③ Fallas/discusiones (1427 msgs)
  - ④ Acuerdo devolución (144 msgs)
  - ⑤ Se niega a pagar (180 msgs)
  - ⚠️ Puntos débiles (filtered view)

### Filtering
- Chapter filter (sidebar clicks)
- Search bar (searches message_text + transcription)
- Filter by: sender, message_type, is_key_evidence, is_weak_point
- Jump to evidence_id (type AUD-109 and scroll to it)

### Data fetching
Fetch from Supabase table `chat_evidence` where case_id matches.
Use the service role key via API route.

Add API route: GET /api/chat-evidence?case_id=X&chapter=Y&search=Z

### Supabase connection
Same as existing: 
- URL: process.env.NEXT_PUBLIC_SUPABASE_URL
- Use supabaseServer for API routes

### Style
- Keep the light theme (white bg, green accents)
- Chat bubbles: green-100 for Matias (right-aligned), white with border for Toro (left-aligned)
- Evidence badges: small pill with mono font, green-800 bg
- Date separators: centered, gray-400, small text
- Transcriptions: italic, gray-500, below audio bubble
- Key evidence: border-l-4 border-yellow-400
- Weak points: border-l-4 border-red-400

### Performance
- Paginate: load 100 messages at a time, infinite scroll
- Chapter click loads only that chapter's messages

## Build steps
1. Create API route /api/chat-evidence
2. Create ChatView component
3. Create EvidencePanel component  
4. Add chat page at /case/[slug]/chat
5. Update sidebar/navigation to include chat chapters
6. npm run build
7. Commit

When done: openclaw system event --text "Done: Chat view built" --mode now
