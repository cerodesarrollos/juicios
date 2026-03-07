import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const caseId = req.nextUrl.searchParams.get('case_id')
  if (!caseId) {
    return NextResponse.json({ error: 'case_id required' }, { status: 400 })
  }

  const chapter = req.nextUrl.searchParams.get('chapter')
  const search = req.nextUrl.searchParams.get('search')
  const sender = req.nextUrl.searchParams.get('sender')
  const messageType = req.nextUrl.searchParams.get('message_type')
  const keyEvidence = req.nextUrl.searchParams.get('key_evidence')
  const weakPoints = req.nextUrl.searchParams.get('weak_points')
  const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0', 10)
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '100', 10)

  let query = supabaseServer
    .from('chat_evidence')
    .select('*', { count: 'exact' })
    .eq('case_id', caseId)
    .order('sort_order', { ascending: true })

  if (chapter) query = query.eq('chapter', parseInt(chapter, 10))
  if (sender) query = query.eq('sender', sender)
  if (messageType) query = query.eq('message_type', messageType)
  if (keyEvidence === 'true') query = query.eq('is_key_evidence', true)
  if (weakPoints === 'true') query = query.eq('is_weak_point', true)
  if (search) query = query.or(`message_text.ilike.%${search}%,transcription.ilike.%${search}%`)

  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data, total: count })
}
