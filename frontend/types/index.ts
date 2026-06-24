export type PaginatedResponse<T> = {
  count: number
  total_pages: number
  page: number
  results: T[]
}

export type User = {
  id: number
  phone: string
  full_name: string
  nid: string
  role: 'individual' | 'foundation'
  is_verified: boolean
  is_active: boolean
  has_merchant_profile: boolean
  created_at: string
}

export type Wallet = {
  id: number
  user_phone: string
  balance: string
  daily_limit: string
  status: 'active' | 'frozen'
  created_at: string
}

export type Transaction = {
  id: number
  reference_id: string
  sender_phone: string | null
  receiver_phone: string | null
  merchant_name: string | null
  amount: string
  fee: string
  transaction_type: 'send' | 'cash_in' | 'cash_out' | 'payment'
  status: 'pending' | 'completed' | 'failed' | 'reversed'
  note: string | null
  created_at: string
}

export type Notification = {
  id: number
  message: string
  is_read: boolean
  created_at: string
}

export type Card = {
  id: number
  last_four: string
  card_type: 'debit' | 'prepaid'
  expiry_month: number
  expiry_year: number
  status: 'active' | 'blocked' | 'expired'
  created_at: string
}

export type Merchant = {
  id: number
  business_name: string
  category: string
  is_verified: boolean
  phone: string
}

export type Foundation = {
  id: number
  organization_name: string
  cause: string
  description: string
  website: string
  contact_email: string
  contact_phone: string
  is_verified: boolean
  phone: string
  user_id: number
  created_at: string
}

export type MudarabahPlan = {
  id: number
  name: string
  duration_months: number
  monthly_amount: string
  profit_ratio: string
  is_active: boolean
}

export type MudarabahAccount = {
  id: number
  account_number: string
  plan: number
  plan_details: MudarabahPlan
  status: 'active' | 'matured' | 'closed'
  start_date: string
  maturity_date: string
  total_deposited: string
  expected_payout: string
  created_at: string
}

export type MudarabahContribution = {
  id: number
  mudarabah_account: number
  installment_number: number
  amount: string
  status: 'paid' | 'missed'
  paid_at: string
}

export type ZakatPayment = {
  id: number
  amount: string
  asset_type: string | null
  hawl_year: number | null
  recipient: number | null
  recipient_name: string | null
  paid_at: string
}

export type Sadaqah = {
  id: number
  amount: string
  cause: string | null
  is_anonymous: boolean
  recipient: number | null
  recipient_name: string | null
  given_at: string
}

export type HawlTracking = {
  nisab_crossed_at: string | null
  next_hawl_date: string | null
  is_eligible: boolean
  updated_at: string
}

export type SadaqahJariyah = {
  id: number
  amount: string
  cause: string | null
  frequency: 'monthly'
  is_active: boolean
  recipient: number | null
  recipient_name: string | null
  start_date: string
  next_due_date: string | null
  total_donated: string
  created_at: string
}
