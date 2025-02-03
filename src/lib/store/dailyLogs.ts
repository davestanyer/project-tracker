import { create } from 'zustand'
import { supabase } from '../supabase/client'
import type { Database } from '../supabase/types'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

type DailyLog = Database['public']['Tables']['daily_logs']['Row']

interface DailyLogsState {
  logs: DailyLog[]
  loading: boolean
  error: string | null
  fetchLogs: (projectId: string, startDate: Date, endDate: Date) => Promise<void>
  createLog: (data: {
    project_id: string
    date: string
    hours_spent: number
    work_description: string[]
  }) => Promise<void>
  updateLog: (id: string, data: {
    hours_spent: number
    work_description: string[]
  }) => Promise<void>
  deleteLog: (id: string) => Promise<void>
}

export const useDailyLogsStore = create<DailyLogsState>((set, get) => ({
  logs: [],
  loading: false,
  error: null,
  fetchLogs: async (projectId, startDate, endDate) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('project_id', projectId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true })

      if (error) throw error
      set({ logs: data || [] })
    } catch (error) {
      set({ error: (error as Error).message })
    } finally {
      set({ loading: false })
    }
  },
  createLog: async ({ project_id, date, hours_spent, work_description }) => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('daily_logs')
        .insert([{
          project_id,
          user_id: user.id,
          date,
          hours_spent,
          work_description
        }])

      if (error) throw error
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    } finally {
      set({ loading: false })
    }
  },
  updateLog: async (id, { hours_spent, work_description }) => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase
        .from('daily_logs')
        .update({ hours_spent, work_description })
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    } finally {
      set({ loading: false })
    }
  },
  deleteLog: async (id) => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase
        .from('daily_logs')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    } finally {
      set({ loading: false })
    }
  }
}))