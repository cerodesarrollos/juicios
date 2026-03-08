import { supabaseServer } from '@/lib/supabase-server'
import { Case } from '@/lib/types'
import { notFound } from 'next/navigation'
import ChatPage from './ChatPage'

export const dynamic = 'force-dynamic'

export default async function ChatPageRoute({ params }: { params: { slug: string } }) {
  const { data: cases } = await supabaseServer
    .from('cases')
    .select('*')
    .eq('slug', params.slug)
    .limit(1)

  const caseData = cases?.[0] as Case | undefined
  if (!caseData) notFound()

  // Fetch chapter counts via RPC (avoids 1000 row default limit)
  const { data: chapterData } = await supabaseServer.rpc('get_chat_chapters', { p_case_id: caseData.id })
  const chapters: { chapter: number; name: string; count: number }[] = (chapterData || []).map(
    (r: { chapter: number; name: string; count: number }) => ({ chapter: r.chapter, name: r.name, count: r.count })
  )

  // Weak points count
  const { count: weakCount } = await supabaseServer
    .from('chat_evidence')
    .select('id', { count: 'exact', head: true })
    .eq('case_id', caseData.id)
    .eq('is_weak_point', true)

  return (
    <ChatPage
      caseData={caseData}
      chapters={chapters}
      weakPointsCount={weakCount ?? 0}
    />
  )
}
