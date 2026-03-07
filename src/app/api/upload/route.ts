import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const caseSlug = formData.get('case_slug') as string
  const caseId = formData.get('case_id') as string
  const proofId = formData.get('proof_id') as string
  const slot = formData.get('slot') as string
  const transactionId = formData.get('transaction_id') as string

  if (!file || !caseSlug || !caseId || !proofId || !slot || !transactionId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const filePath = `case-files/${caseSlug}/${proofId}/${slot}/${file.name}`

  const { error: uploadError } = await supabaseServer.storage
    .from('case-files')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: urlData } = supabaseServer.storage
    .from('case-files')
    .getPublicUrl(filePath)

  // Determine type from mime
  let evidenceType = 'documento'
  if (file.type.startsWith('image/')) evidenceType = 'imagen'
  else if (file.type.startsWith('audio/')) evidenceType = 'audio'
  else if (file.type === 'application/pdf') evidenceType = 'pdf'

  // Check if evidence record already exists for this slot+transaction
  const { data: existing } = await supabaseServer
    .from('evidence')
    .select('id')
    .eq('transaction_id', transactionId)
    .eq('slot', slot)
    .limit(1)
    .single()

  let evidenceData
  if (existing) {
    const { data } = await supabaseServer
      .from('evidence')
      .update({
        file_name: file.name,
        file_path: filePath,
        file_url: urlData.publicUrl,
        mime_type: file.type,
        status: 'adjuntado',
        type: evidenceType,
      })
      .eq('id', existing.id)
      .select()
      .single()
    evidenceData = data
  } else {
    const { data } = await supabaseServer
      .from('evidence')
      .insert({
        case_id: caseId,
        transaction_id: transactionId,
        proof_id: proofId,
        slot,
        type: evidenceType,
        file_name: file.name,
        file_path: filePath,
        file_url: urlData.publicUrl,
        mime_type: file.type,
        status: 'adjuntado',
      })
      .select()
      .single()
    evidenceData = data
  }

  await supabaseServer.from('activity_log').insert({
    case_id: caseId,
    action: 'uploaded',
    entity_type: 'evidence',
    entity_id: evidenceData?.id,
    description: `Archivo "${file.name}" subido para ${proofId}/${slot}`,
  })

  return NextResponse.json(evidenceData, { status: 201 })
}
