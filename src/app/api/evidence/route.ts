import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data, error } = await supabaseServer
    .from('evidence')
    .insert({
      case_id: body.case_id,
      transaction_id: body.transaction_id || null,
      slot: body.slot,
      evidence_type: body.evidence_type || 'documento',
      title: body.title || '',
      description: body.description || null,
      file_path: body.file_path,
      file_url: body.file_url || null,
      file_type: body.file_type || null,
      file_size_bytes: body.file_size_bytes || null,
      original_filename: body.original_filename || null,
      original_source: body.original_source || null,
      status: body.status || 'pendiente',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
