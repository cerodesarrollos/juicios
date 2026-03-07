import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Auto-generate proof_id if not provided
  let proofId = body.proof_id
  if (!proofId) {
    const { count } = await supabaseServer
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('case_id', body.case_id)
    proofId = `P-${String((count ?? 0) + 1).padStart(3, '0')}`
  }

  // Auto sort_order
  const { data: lastTx } = await supabaseServer
    .from('transactions')
    .select('sort_order')
    .eq('case_id', body.case_id)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const sortOrder = (lastTx?.sort_order ?? 0) + 1

  const { data, error } = await supabaseServer
    .from('transactions')
    .insert({
      case_id: body.case_id,
      proof_id: proofId,
      date: body.date,
      type: body.type,
      from_party_id: body.from_party_id,
      to_party_id: body.to_party_id,
      amount_usd: body.amount_usd,
      amount_ars: body.amount_ars,
      method: body.method,
      concept: body.concept,
      status: body.status || 'pendiente',
      phase: body.phase || 1,
      phase_name: body.phase_name || 'Fase 1',
      direction: body.direction || 'entrada',
      notes: body.notes || null,
      sort_order: sortOrder,
      balance_after: '',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabaseServer.from('activity_log').insert({
    case_id: body.case_id,
    action: 'created',
    entity_type: 'transaction',
    entity_id: data.id,
    description: `Transaccion ${proofId} creada: ${body.concept}`,
  })

  return NextResponse.json(data, { status: 201 })
}
