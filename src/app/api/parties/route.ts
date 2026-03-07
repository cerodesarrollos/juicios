import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data, error } = await supabaseServer
    .from('parties')
    .insert({
      case_id: body.case_id,
      name: body.name,
      cuil_cuit: body.cuil_cuit,
      dni: body.dni,
      role: body.role,
      relationship: body.relationship,
      phone: body.phone,
      email: body.email,
      notes: body.notes,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseServer.from('activity_log').insert({
    case_id: body.case_id,
    action: 'created',
    entity_type: 'party',
    entity_id: data.id,
    description: `Parte "${data.name}" agregada (${data.role})`,
  })

  return NextResponse.json(data, { status: 201 })
}
