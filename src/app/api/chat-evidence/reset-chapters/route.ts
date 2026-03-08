import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { case_id } = body

  if (!case_id) return NextResponse.json({ error: 'case_id required' }, { status: 400 })

  const { error, count } = await supabaseServer
    .from('chat_evidence')
    .update({ chapter: 0, chapter_name: 'Sin clasificar' })
    .eq('case_id', case_id)
    .gt('chapter', 0)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, updated: count })
}
