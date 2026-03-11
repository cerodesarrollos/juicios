import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

const CASE_ID = '571d7e4e-73af-4878-9a8b-05b0a7cd2d49'
const BUCKET = 'case-files'
const BASE_PATH = 'caso-toro/media'

// GET — list files by category
export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category')
  if (!category) {
    return NextResponse.json({ error: 'category required' }, { status: 400 })
  }

  const folderPath = `${BASE_PATH}/${category}`
  const { data, error } = await supabaseServer.storage
    .from(BUCKET)
    .list(folderPath, { limit: 200, sortBy: { column: 'created_at', order: 'desc' } })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const files = (data || [])
    .filter(f => f.name && !f.name.startsWith('.'))
    .map(f => {
      const { data: urlData } = supabaseServer.storage
        .from(BUCKET)
        .getPublicUrl(`${folderPath}/${f.name}`)
      return {
        name: f.name,
        url: urlData.publicUrl,
        size: f.metadata?.size || 0,
        contentType: f.metadata?.mimetype || '',
        createdAt: f.created_at,
      }
    })

  return NextResponse.json({ files })
}

// POST — upload file to category
export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const category = formData.get('category') as string

  if (!file || !category) {
    return NextResponse.json({ error: 'file and category required' }, { status: 400 })
  }

  const validCategories = ['fotos', 'videos', 'screenshots']
  if (!validCategories.includes(category)) {
    return NextResponse.json({ error: 'invalid category' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const filePath = `${BASE_PATH}/${category}/${timestamp}-${safeName}`

  const { error: uploadError } = await supabaseServer.storage
    .from(BUCKET)
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: urlData } = supabaseServer.storage
    .from(BUCKET)
    .getPublicUrl(filePath)

  // Log activity (best-effort)
  try {
    await supabaseServer.from('activity_log').insert({
      case_id: CASE_ID,
      action: 'uploaded',
      entity_type: 'doc_media',
      description: `${category}: ${file.name}`,
    })
  } catch { /* ignore */ }

  return NextResponse.json({
    name: safeName,
    url: urlData.publicUrl,
    contentType: file.type,
    size: file.size,
  }, { status: 201 })
}

// DELETE — remove file
export async function DELETE(req: NextRequest) {
  const { category, name } = await req.json()
  if (!category || !name) {
    return NextResponse.json({ error: 'category and name required' }, { status: 400 })
  }

  const filePath = `${BASE_PATH}/${category}/${name}`
  const { error } = await supabaseServer.storage
    .from(BUCKET)
    .remove([filePath])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
