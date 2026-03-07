import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data, error } = await supabaseServer
    .from('evidence')
    .insert({
      case_id: body.case_id,
      transaction_id: body.transaction_id || null,
      proof_id: body.proof_id || null,
      slot: body.slot,
      type: body.type || 'documento',
      file_name: body.file_name,
      file_path: body.file_path,
      file_url: body.file_url || null,
      mime_type: body.mime_type || null,
      status: body.status || 'adjuntado',
      notes: body.notes || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
