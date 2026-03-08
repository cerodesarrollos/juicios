import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const caseId = req.nextUrl.searchParams.get('case_id')
  if (!caseId) {
    return NextResponse.json({ error: 'case_id required' }, { status: 400 })
  }

  // Use RPC or raw query to get chapter counts efficiently
  const { data, error } = await supabaseServer.rpc('get_chat_chapters', { p_case_id: caseId })

  if (error) {
    // Fallback: manual aggregation
    const { data: rows } = await supabaseServer
      .from('chat_evidence')
      .select('chapter, chapter_name')
      .eq('case_id', caseId)
      .not('chapter', 'is', null)

    const map = new Map<number, { chapter: number; name: string; count: number }>()
    if (rows) {
      for (const r of rows) {
        const e = map.get(r.chapter)
        if (e) e.count++
        else map.set(r.chapter, { chapter: r.chapter, name: r.chapter_name || `Capítulo ${r.chapter}`, count: 1 })
      }
    }
    return NextResponse.json(Array.from(map.values()).sort((a, b) => a.chapter - b.chapter))
  }

  return NextResponse.json(data)
}
