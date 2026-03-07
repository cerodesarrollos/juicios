import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const { data: link, error: linkError } = await supabaseServer
    .from('shared_links')
    .select('*')
    .eq('token', params.token)
    .single()

  if (linkError || !link) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 })
  }

  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Link expired' }, { status: 410 })
  }

  const [
    { data: caseData },
    { data: transactions },
    { data: evidence },
    { data: parties },
  ] = await Promise.all([
    supabaseServer.from('cases').select('*').eq('id', link.case_id).single(),
    supabaseServer.from('transactions')
      .select('*, from_party:parties!transactions_from_party_id_fkey(name), to_party:parties!transactions_to_party_id_fkey(name)')
      .eq('case_id', link.case_id)
      .order('sort_order'),
    supabaseServer.from('evidence').select('*').eq('case_id', link.case_id),
    supabaseServer.from('parties').select('*').eq('case_id', link.case_id).order('role'),
  ])

  return NextResponse.json({
    case: caseData,
    transactions: transactions ?? [],
    evidence: evidence ?? [],
    parties: parties ?? [],
  })
}
