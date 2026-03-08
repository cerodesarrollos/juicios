import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const case_id = searchParams.get('case_id')
  const evidence_type = searchParams.get('evidence_type')

  if (!case_id) {
    return NextResponse.json({ error: 'case_id requerido' }, { status: 400 })
  }

  let query = supabaseServer
    .from('evidence')
    .select('id, title, description, original_date, evidence_type')
    .eq('case_id', case_id)
    .order('created_at', { ascending: false })

  if (evidence_type) {
    query = query.eq('evidence_type', evidence_type)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ evidence: data })
}

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
