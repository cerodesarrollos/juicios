import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data, error } = await supabaseServer
    .from('shared_links')
    .insert({
      case_id: body.case_id,
      expires_at: body.expires_at || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseServer.from('activity_log').insert({
    case_id: body.case_id,
    action: 'created',
    entity_type: 'shared_link',
    entity_id: data.id,
    description: 'Enlace compartido generado',
  })

  return NextResponse.json(data, { status: 201 })
}

export async function GET(req: NextRequest) {
  const caseId = req.nextUrl.searchParams.get('case_id')
  if (!caseId) return NextResponse.json({ error: 'case_id required' }, { status: 400 })

  const { data, error } = await supabaseServer
    .from('shared_links')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
