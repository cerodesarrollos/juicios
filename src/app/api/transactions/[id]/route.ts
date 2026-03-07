import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { data, error } = await supabaseServer
    .from('transactions')
    .update({
      date: body.date,
      type: body.type,
      from_party_id: body.from_party_id,
      to_party_id: body.to_party_id,
      amount_usd: body.amount_usd,
      amount_ars: body.amount_ars,
      method: body.method,
      concept: body.concept,
      status: body.status,
      phase: body.phase,
      phase_name: body.phase_name,
      direction: body.direction,
      notes: body.notes,
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseServer.from('activity_log').insert({
    case_id: data.case_id,
    action: 'updated',
    entity_type: 'transaction',
    entity_id: params.id,
    description: `Transaccion ${data.proof_id} actualizada`,
  })

  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { data } = await supabaseServer
    .from('transactions')
    .select('case_id, proof_id')
    .eq('id', params.id)
    .single()

  const { error } = await supabaseServer.from('transactions').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (data) {
    await supabaseServer.from('activity_log').insert({
      case_id: data.case_id,
      action: 'deleted',
      entity_type: 'transaction',
      entity_id: params.id,
      description: `Transaccion ${data.proof_id} eliminada`,
    })
  }

  return NextResponse.json({ ok: true })
}
