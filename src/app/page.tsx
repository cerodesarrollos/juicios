import { supabaseServer } from '@/lib/supabase-server'
import { CaseSummary } from '@/lib/types'
import HomeClient from './HomeClient'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const { data } = await supabaseServer.from('case_summary').select('*')
  const cases = (data ?? []) as CaseSummary[]

  return <HomeClient cases={cases} />
}
