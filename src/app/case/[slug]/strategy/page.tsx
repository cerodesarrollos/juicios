import { supabaseServer } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import StrategyPage from './StrategyPage'

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { data: caseData } = await supabaseServer
    .from('cases')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!caseData) notFound()

  return <StrategyPage caseData={caseData} />
}
