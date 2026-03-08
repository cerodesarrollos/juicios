# Task: Add PDF parsing to evidence embedding pipeline

## Context
Evidence PDFs are stored in Supabase Storage bucket `case-files` path `caso-toro/documents`.
The evidence table has `file_url` and `file_path` fields.
We need to download PDFs, extract text, and include them in the RAG embeddings.

## Steps

### 1. Install pdf-parse
```bash
npm install pdf-parse
```

### 2. Update `src/app/api/embed-evidence/route.ts`
When processing evidence records:
1. Check if `file_url` or `file_path` exists AND `file_type` contains 'pdf'
2. Download the PDF from Supabase Storage using a signed URL
3. Parse text with pdf-parse
4. Chunk the text into ~500 word segments
5. Create embedding chunks with source_table='evidence_pdf', metadata including title, evidence_type, original_filename

For downloading from storage:
```typescript
const { data } = await supabaseServer.storage
  .from('case-files')
  .download(filePath)
// or fetch the file_url directly if it's a signed/public URL
```

If file_url is already a full URL, just fetch it directly.
If file_path is a storage path, use supabaseServer.storage to download.

### 3. Also handle images with descriptions
For image evidence (photos, screenshots), use the `description` field as content since we can't OCR images server-side easily.

### 4. Error handling
- If PDF parsing fails, log error and skip (don't crash)
- If file not found, skip
- Add count of PDFs parsed to response

### 5. When done
```bash
git add -A && git commit -m "feat: PDF parsing for evidence embedding pipeline" && git push origin main
```
