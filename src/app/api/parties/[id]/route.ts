import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { data, error } = await supabaseServer
    .from('parties')
    .update({
      name: body.name,
      cuil_cuit: body.cuil_cuit,
      dni: body.dni,
      role: body.role,
      relationship: body.relationship,
      phone: body.phone,
      email: body.email,
      notes: body.notes,
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseServer.from('activity_log').insert({
    case_id: data.case_id,
    action: 'updated',
    entity_type: 'party',
    entity_id: params.id,
    description: `Parte "${data.name}" actualizada`,
  })

  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { data } = await supabaseServer
    .from('parties')
    .select('case_id, name')
    .eq('id', params.id)
    .single()

  const { error } = await supabaseServer.from('parties').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (data) {
    await supabaseServer.from('activity_log').insert({
      case_id: data.case_id,
      action: 'deleted',
      entity_type: 'party',
      entity_id: params.id,
      description: `Parte "${data.name}" eliminada`,
    })
  }

  return NextResponse.json({ ok: true })
}
