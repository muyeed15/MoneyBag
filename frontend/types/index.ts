export type PaginatedResponse<T> = {
  count: number
  total_pages: number
  page: number
  results: T[]
}

export type PhoneLookup = {
  phone: string
  name: string
  full_name: string
  type: 'merchant' | 'user' | 'agent'
  is_verified_merchant: boolean
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
  masked_number: string
  cardholder_name: string
  card_network: 'visa' | 'mastercard' | 'amex' | 'nexus'
  card_type: 'debit' | 'prepaid'
  expiry_month: number
  expiry_year: number
  status: 'active' | 'blocked' | 'expired'
  created_at: string
}

export type FoundationCategory = {
  key: string
  label: string
  icon: string
  count: number
}

export type Foundation = {
  id: number
  organization_name: string
  cause: string
  cause_label: string
  cause_icon: string
  logo: string | null
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
  cause_label: string | null
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
  cause_label: string | null
  frequency: 'monthly'
  is_active: boolean
  recipient: number | null
  recipient_name: string | null
  start_date: string
  next_due_date: string | null
  total_donated: string
  created_at: string
}

export type Operator = {
  id: number
  name: string
  operator_code: string
  logo: string | null
  type: 'prepaid' | 'postpaid' | 'both'
  is_active: boolean
}

export type DataPack = {
  id: number
  operator: number
  operator_name: string
  name: string
  volume: string
  validity_days: number
  amount: string
  is_active: boolean
}

export type BillerCategory = {
  key: string
  label: string
  count: number
}

export type Biller = {
  id: number
  name: string
  category: string
  category_label: string
  biller_code: string
  logo: string | null
  account_no_label: string
  amount_no_label: string
  is_active: boolean
}

export type Agent = {
  id: number
  full_name: string
  phone: string
  shop_name: string
  district: string
  thana: string
  address: string
  latitude: string
  longitude: string
  is_verified: boolean
  status: string
}

export type QardHasanProduct = {
  id: number
  name: string
  min_amount: string
  max_amount: string
  tenure_days: number
  service_fee: string
  description: string
  is_active: boolean
}

export type QardHasanApplication = {
  id: number
  loan_reference: string
  product: number
  product_name: string
  amount: string
  service_fee: string
  amount_due: string
  amount_paid: string
  hibah_given: string
  tenure_days: number
  status: string
  due_date: string | null
  disbursed_at: string | null
  created_at: string
}

export type TicketCategory = {
  key: string
  label: string
  count: number
}

export type TicketProvider = {
  id: number
  name: string
  category: string
  category_label: string
  logo: string | null
  is_active: boolean
  trips: {
    id: number
    provider: number
    name: string
    origin: string
    destination: string
    departure_time: string
    arrival_time: string
    coach_class: string
    coaches: string[]
    price: string
    is_active: boolean
  }[]
}

export type TicketBooking = {
  id: number
  booking_reference: string
  provider: number
  provider_name: string
  provider_category: string
  journey_date: string
  departure_time: string
  origin: string
  destination: string
  trip_name: string
  coach_class: string
  coach: string
  seat_number: string
  passengers: number
  amount: string
  fee: string
  status: string
  created_at: string
}

export type SupportCategory = {
  key: string
  label: string
}

export type SupportTicket = {
  id: number
  user_phone: string
  subject: string
  category: string
  category_label: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  messages: {
    id: number
    sender: number
    sender_phone: string
    message: string
    is_staff_reply: boolean
    created_at: string
  }[]
  created_at: string
  updated_at: string
}
