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

  // Fetch chapter counts for sidebar
  const { data: chapterCounts } = await supabaseServer
    .from('chat_evidence')
    .select('chapter, chapter_name')
    .eq('case_id', caseData.id)

  const chapters: { chapter: number; name: string; count: number }[] = []
  if (chapterCounts) {
    const map = new Map<number, { name: string; count: number }>()
    for (const row of chapterCounts) {
      const existing = map.get(row.chapter)
      if (existing) {
        existing.count++
      } else {
        map.set(row.chapter, { name: row.chapter_name, count: 1 })
      }
    }
    for (const [ch, val] of map) {
      chapters.push({ chapter: ch, name: val.name, count: val.count })
    }
    chapters.sort((a, b) => a.chapter - b.chapter)
  }

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
