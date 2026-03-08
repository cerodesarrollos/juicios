import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const caseId = req.nextUrl.searchParams.get('case_id')
  if (!caseId) {
    return NextResponse.json({ error: 'case_id required' }, { status: 400 })
  }

  const { data, error } = await supabaseServer.rpc('get_chat_chapters', { p_case_id: caseId })

  if (error) {
    return NextResponse.json([], { status: 200 })
  }

  // Map to expected shape
  const chapters = (data || []).map((r: { chapter: number; name: string; count: number }) => ({
    chapter: r.chapter,
    name: r.name,
    count: r.count,
  }))

  return NextResponse.json(chapters)
}
