import { supabaseServer } from '@/lib/supabase-server'
import { Case, Party, Evidence, Transcription, TimelineEvent, ActivityLog, BankAccount, TransactionWithParties } from '@/lib/types'
import { notFound } from 'next/navigation'
import CaseDetail from './CaseDetail'

export const dynamic = 'force-dynamic'

export default async function CaseDetailPage({ params }: { params: { slug: string } }) {
  const { data: cases } = await supabaseServer
    .from('cases')
    .select('*')
    .eq('slug', params.slug)
    .limit(1)

  const caseData = cases?.[0] as Case | undefined
  if (!caseData) notFound()

  const [
    { data: transactions },
    { data: evidence },
    { data: parties },
    { data: bankAccounts },
    { data: transcriptions },
    { data: timelineEvents },
    { data: activityLog },
  ] = await Promise.all([
    supabaseServer.from('transactions')
      .select('*, from_party:parties!transactions_from_party_id_fkey(name), to_party:parties!transactions_to_party_id_fkey(name)')
      .eq('case_id', caseData.id)
      .order('sort_order'),
    supabaseServer.from('evidence').select('*').eq('case_id', caseData.id),
    supabaseServer.from('parties').select('*').eq('case_id', caseData.id).order('role'),
    supabaseServer.from('bank_accounts').select('*').eq('case_id', caseData.id),
    supabaseServer.from('transcriptions').select('*').eq('case_id', caseData.id),
    supabaseServer.from('timeline_events').select('*').eq('case_id', caseData.id).order('date'),
    supabaseServer.from('activity_log').select('*').eq('case_id', caseData.id).order('created_at', { ascending: false }).limit(20),
  ])

  return (
    <CaseDetail
      caseData={caseData}
      transactions={(transactions ?? []) as TransactionWithParties[]}
      evidence={(evidence ?? []) as Evidence[]}
      parties={(parties ?? []) as Party[]}
      bankAccounts={(bankAccounts ?? []) as BankAccount[]}
      transcriptions={(transcriptions ?? []) as Transcription[]}
      timelineEvents={(timelineEvents ?? []) as TimelineEvent[]}
      activityLog={(activityLog ?? []) as ActivityLog[]}
    />
  )
}
