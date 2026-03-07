export interface Case {
  id: string
  slug: string
  title: string
  description: string
  status: string
  plaintiff_name: string
  plaintiff_cuil: string
  defendant_name: string
  defendant_cuil: string
  defendant_dni: string
  total_debt_usd: number
  total_paid_usd: number
  currency: string
  start_date: string
  case_type: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Party {
  id: string
  case_id: string
  name: string
  cuil_cuit: string | null
  dni: string | null
  role: string
  relationship: string | null
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  created_at: string
}

export interface BankAccount {
  id: string
  party_id: string
  case_id: string
  bank: string
  cbu: string | null
  alias: string | null
  type: string
  currency: string
  notes: string | null
  created_at: string
}

export interface Transaction {
  id: string
  case_id: string
  proof_id: string
  date: string
  type: string
  from_party_id: string | null
  to_party_id: string | null
  from_account_id: string | null
  amount_usd: number | null
  amount_ars: number | null
  amount_usdt: number | null
  method: string
  concept: string
  balance_after: string
  status: string
  phase: number
  phase_name: string
  direction: string
  notes: string | null
  sort_order: number
  created_at: string
  // joined
  from_party?: Party
  to_party?: Party
}

export interface Evidence {
  id: string
  case_id: string
  transaction_id: string | null
  proof_id: string | null
  slot: string
  type: string
  file_name: string
  file_path: string
  file_url: string | null
  mime_type: string | null
  status: string
  notes: string | null
  created_at: string
}

export interface Transcription {
  id: string
  evidence_id: string
  case_id: string
  text: string
  language: string
  created_at: string
}

export interface TimelineEvent {
  id: string
  case_id: string
  date: string
  title: string
  description: string | null
  type: string
  linked_transaction_id: string | null
  created_at: string
}

export interface CaseSummary {
  id: string
  slug: string
  title: string
  status: string
  plaintiff_name: string
  defendant_name: string
  total_debt_usd: number
  total_paid_usd: number
  pending_usd: number
  total_transactions: number
  total_evidence: number
  evidence_complete: number
  evidence_pending: number
  total_transcriptions: number
}
