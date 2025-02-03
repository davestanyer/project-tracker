export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          created_by?: string
        }
      }
      project_budgets: {
        Row: {
          id: string
          project_id: string
          month_date: string
          budget_amount: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          month_date: string
          budget_amount: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          month_date?: string
          budget_amount?: number
          created_at?: string
        }
      }
      project_users: {
        Row: {
          project_id: string
          user_id: string
          rate_per_hour: number
          created_at: string
        }
        Insert: {
          project_id: string
          user_id: string
          rate_per_hour: number
          created_at?: string
        }
        Update: {
          project_id?: string
          user_id?: string
          rate_per_hour?: number
          created_at?: string
        }
      }
      monthly_allocations: {
        Row: {
          id: string
          project_id: string
          user_id: string
          month_date: string
          allocated_hours: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          month_date: string
          allocated_hours: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          month_date?: string
          allocated_hours?: number
          created_at?: string
        }
      }
      daily_logs: {
        Row: {
          id: string
          project_id: string
          user_id: string
          date: string
          hours_spent: number
          work_description: string[]
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          date: string
          hours_spent: number
          work_description?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          date?: string
          hours_spent?: number
          work_description?: string[]
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string
        }
      }
    }
  }
}