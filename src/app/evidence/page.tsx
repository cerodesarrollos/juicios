import { supabaseServer } from '@/lib/supabase-server'
import EvidenceView from './EvidenceView'

export const revalidate = 60

export default async function EvidencePage() {
  const { data: evidence } = await supabaseServer
    .from('evidence')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: transactions } = await supabaseServer
    .from('transactions')
    .select('id, proof_id, concept')
    .order('sort_order')

  const { data: transcriptions } = await supabaseServer
    .from('transcriptions')
    .select('*')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Evidencia</h1>
        <p className="mt-1 text-sm text-text-muted">{evidence?.length ?? 0} archivos registrados</p>
      </div>
      <EvidenceView
        evidence={evidence ?? []}
        transactions={transactions ?? []}
        transcriptions={transcriptions ?? []}
      />
    </div>
  )
}
