import { supabaseServer } from '@/lib/supabase-server'
import { Case } from '@/lib/types'
import { notFound } from 'next/navigation'
import AdversarialPage from './AdversarialPage'

export const dynamic = 'force-dynamic'

export default async function AdversarialPageRoute({ params }: { params: { slug: string } }) {
  const { data: cases } = await supabaseServer
    .from('cases')
    .select('*')
    .eq('slug', params.slug)
    .limit(1)

  const caseData = cases?.[0] as Case | undefined
  if (!caseData) notFound()

  return <AdversarialPage caseData={caseData} />
}
