import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { data, error } = await supabaseServer
    .from('cases')
    .update({
      title: body.title,
      description: body.description,
      status: body.status,
      plaintiff_name: body.plaintiff_name,
      plaintiff_cuil: body.plaintiff_cuil,
      defendant_name: body.defendant_name,
      defendant_cuil: body.defendant_cuil,
      defendant_dni: body.defendant_dni,
      total_debt_usd: body.total_debt_usd,
      case_type: body.case_type,
      slug: body.slug,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseServer.from('activity_log').insert({
    case_id: params.id,
    action: 'updated',
    entity_type: 'case',
    entity_id: params.id,
    description: `Caso "${data.title}" actualizado`,
  })

  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await supabaseServer
    .from('cases')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
