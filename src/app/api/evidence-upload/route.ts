import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { case_id, evidence_type, title, description, date, location, source, link } = body

    if (!case_id || !title) {
      return NextResponse.json({ error: 'case_id y title son requeridos' }, { status: 400 })
    }

    const record: Record<string, unknown> = {
      case_id,
      evidence_type: evidence_type || 'video',
      title,
      description: description || null,
      original_date: date || null,
      original_source: source || null,
      file_url: link || null,
      status: 'complete',
    }

    // Store location in description if provided
    if (location) {
      record.description = `${description || ''}${description ? '\n' : ''}Ubicación: ${location}`
    }

    const { data, error } = await supabaseServer
      .from('evidence')
      .insert(record)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ evidence: data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
