import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (slug) {
    const { data, error } = await supabaseServer
      .from('cases')
      .select('*')
      .eq('slug', slug)
      .limit(1)
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 404 })
    return NextResponse.json(data)
  }

  const { data, error } = await supabaseServer.from('case_summary').select('*')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data, error } = await supabaseServer
    .from('cases')
    .insert({
      slug: body.slug,
      title: body.title,
      description: body.description || '',
      status: body.status || 'activo',
      plaintiff_name: body.plaintiff_name,
      plaintiff_cuil: body.plaintiff_cuil || '',
      defendant_name: body.defendant_name,
      defendant_cuil: body.defendant_cuil || '',
      defendant_dni: body.defendant_dni || '',
      total_debt_usd: body.total_debt_usd || 0,
      total_paid_usd: 0,
      currency: 'USD',
      start_date: new Date().toISOString().split('T')[0],
      case_type: body.case_type || 'civil',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseServer.from('activity_log').insert({
    case_id: data.id,
    action: 'created',
    entity_type: 'case',
    entity_id: data.id,
    description: `Caso "${data.title}" creado`,
  })

  return NextResponse.json(data, { status: 201 })
}
