import { supabaseServer } from '@/lib/supabase-server'
import { Party, Transaction } from '@/lib/types'
import { formatUSD } from '@/lib/utils'

export const revalidate = 60

export default async function PartiesPage() {
  const { data: parties } = await supabaseServer
    .from('parties')
    .select('*')
    .order('role')

  const { data: transactions } = await supabaseServer
    .from('transactions')
    .select('id, from_party_id, to_party_id, amount_usd, type, status')

  const { data: accounts } = await supabaseServer
    .from('bank_accounts')
    .select('*')

  const partyList = (parties ?? []) as Party[]
  const txList = (transactions ?? []) as Transaction[]

  // Group parties by role
  const roleGroups: Record<string, Party[]> = {}
  for (const p of partyList) {
    if (!roleGroups[p.role]) roleGroups[p.role] = []
    roleGroups[p.role].push(p)
  }

  const roleLabels: Record<string, string> = {
    acreedor: '💼 Acreedor',
    deudor: '⚠️ Deudor',
    intermediario: '🔗 Intermediario',
    titular_cuenta: '🏦 Titular de Cuenta',
    empleado: '👷 Empleado',
    familiar: '👨‍👩‍👦 Familiar',
    testigo: '👁️ Testigo',
  }

  function getPartyTxSummary(partyId: string) {
    const sent = txList.filter(t => t.from_party_id === partyId)
    const received = txList.filter(t => t.to_party_id === partyId)
    const totalSent = sent.reduce((sum, t) => sum + (t.amount_usd ?? 0), 0)
    const totalReceived = received.reduce((sum, t) => sum + (t.amount_usd ?? 0), 0)
    return { sentCount: sent.length, receivedCount: received.length, totalSent, totalReceived }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Partes</h1>
        <p className="mt-1 text-sm text-text-muted">{partyList.length} personas involucradas</p>
      </div>

      {Object.entries(roleGroups).map(([role, members]) => (
        <div key={role} className="space-y-3">
          <h2 className="text-lg font-semibold">{roleLabels[role] ?? role}</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {members.map(p => {
              const summary = getPartyTxSummary(p.id)
              const partyAccounts = (accounts ?? []).filter((a: { party_id: string }) => a.party_id === p.id)
              return (
                <div key={p.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-xs text-text-muted capitalize">{p.role}</p>
                    </div>
                  </div>

                  {(p.cuil_cuit || p.dni) && (
                    <div className="text-xs text-text-muted space-y-0.5">
                      {p.cuil_cuit && <p>CUIL/CUIT: {p.cuil_cuit}</p>}
                      {p.dni && <p>DNI: {p.dni}</p>}
                    </div>
                  )}

                  {p.phone && (
                    <p className="text-xs text-text-muted">📱 {p.phone}</p>
                  )}

                  {(summary.sentCount > 0 || summary.receivedCount > 0) && (
                    <div className="rounded-lg bg-bg p-2 text-xs space-y-1">
                      {summary.sentCount > 0 && (
                        <p>Enviadas: {summary.sentCount} ({formatUSD(summary.totalSent)})</p>
                      )}
                      {summary.receivedCount > 0 && (
                        <p>Recibidas: {summary.receivedCount} ({formatUSD(summary.totalReceived)})</p>
                      )}
                    </div>
                  )}

                  {partyAccounts.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-text-muted">Cuentas:</p>
                      {partyAccounts.map((a: { id: string; bank: string; alias: string | null; cbu: string | null }) => (
                        <div key={a.id} className="rounded bg-bg p-2 text-xs">
                          <p className="font-medium">{a.bank}</p>
                          {a.alias && <p className="text-text-muted">Alias: {a.alias}</p>}
                          {a.cbu && <p className="text-text-muted">CBU: {a.cbu}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {p.notes && <p className="text-xs text-text-muted">📝 {p.notes}</p>}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
