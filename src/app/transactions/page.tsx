import { supabaseServer } from '@/lib/supabase-server'
import { Transaction } from '@/lib/types'
import TransactionsList from './TransactionsList'

export const revalidate = 60

export default async function TransactionsPage() {
  const { data } = await supabaseServer
    .from('transactions')
    .select('*, from_party:parties!transactions_from_party_id_fkey(name), to_party:parties!transactions_to_party_id_fkey(name)')
    .order('sort_order')

  const { data: evidence } = await supabaseServer
    .from('evidence')
    .select('*')

  const transactions = (data ?? []) as (Transaction & { from_party: { name: string } | null; to_party: { name: string } | null })[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transacciones</h1>
        <p className="mt-1 text-sm text-gray-500">{transactions.length} transacciones registradas</p>
      </div>
      <TransactionsList transactions={transactions} evidence={evidence ?? []} />
    </div>
  )
}
