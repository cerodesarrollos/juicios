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
  const filePath = `${caseSlug}/${proofId}/${slot}/${file.name}`

  const { error: uploadError } = await supabaseServer.storage
    .from('case-files')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  // Get signed URL (bucket is private)
  const { data: urlData } = await supabaseServer.storage
    .from('case-files')
    .createSignedUrl(filePath, 60 * 60 * 24 * 365) // 1 year

  const fileUrl = urlData?.signedUrl || ''

  // Map mime to evidence_type enum
  let evidenceType = 'documento'
  if (file.type.startsWith('image/')) evidenceType = 'foto'
  else if (file.type.startsWith('audio/')) evidenceType = 'audio'
  else if (file.type.startsWith('video/')) evidenceType = 'video'
  else if (file.type === 'application/pdf') evidenceType = 'documento'

  // Map slot to evidence_type if more specific
  if (slot === 'comprobante') evidenceType = 'comprobante'
  else if (slot === 'captura') evidenceType = 'captura'
  else if (slot === 'audio') evidenceType = 'audio'

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
        title: `${proofId} — ${slot}`,
        file_path: filePath,
        file_url: fileUrl,
        file_type: file.type,
        file_size_bytes: file.size,
        original_filename: file.name,
        status: 'adjuntado',
        evidence_type: evidenceType,
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
        evidence_type: evidenceType,
        title: `${proofId} — ${slot}`,
        file_path: filePath,
        file_url: fileUrl,
        file_type: file.type,
        file_size_bytes: file.size,
        original_filename: file.name,
        status: 'adjuntado',
        slot,
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
