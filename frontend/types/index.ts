export type User = {
  id: number
  phone: string
  full_name: string
  nid: string
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
  type: 'send' | 'cash_in' | 'cash_out' | 'payment'
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
