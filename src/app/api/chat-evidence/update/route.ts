import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, is_key_evidence, chapter, chapter_name } = body

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const updates: Record<string, unknown> = {}
  if (typeof is_key_evidence === 'boolean') updates.is_key_evidence = is_key_evidence
  if (typeof chapter === 'number') {
    updates.chapter = chapter
    if (chapter_name) updates.chapter_name = chapter_name
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'no updates' }, { status: 400 })
  }

  const { error } = await supabaseServer
    .from('chat_evidence')
    .update(updates)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
