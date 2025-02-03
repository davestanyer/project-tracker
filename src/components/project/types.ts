import type { User } from '@supabase/supabase-js'

export type View = 'logs' | 'team' | 'allocate'

export type MonthlyBudget = {
  month_date: string
  budget_amount: number
}

export type UserProfile = {
  id: string
  email: string
  full_name: string | null
}

export type NewLog = {
  hours_spent: number
  work_description: string[]
  date: string
}

export type TeamMember = {
  user_id: string
  rate_per_hour: number
  monthly_hours_budget: number
}