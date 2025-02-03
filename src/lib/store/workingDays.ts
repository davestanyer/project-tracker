import { create } from 'zustand'
import { supabase } from '../supabase/client'
import { format, startOfMonth, endOfMonth } from 'date-fns'

const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY = 1000 // 1 second

async function fetchWithRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = INITIAL_RETRY_DELAY
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (retries > 0 && error instanceof Error && error.message.includes('Failed to fetch')) {
      await new Promise(resolve => setTimeout(resolve, delay))
      return fetchWithRetry(operation, retries - 1, delay * 2)
    }
    throw error
  }
}

interface WorkingDaysState {
  workingDays: Record<string, number>
  loading: boolean
  error: string | null
  fetchWorkingDays: (date: Date) => Promise<void>,
  getWorkingDaysToDate: (date: Date) => Promise<number>
}

export const useWorkingDaysStore = create<WorkingDaysState>((set, get) => ({
  workingDays: {},
  loading: false,
  error: null,
  fetchWorkingDays: async (date: Date) => {
    const monthDate = format(date, 'yyyy-MM-dd')
    
    set({ loading: true, error: null })
    try {
      const { data, error } = await fetchWithRetry(() => 
        supabase.rpc('get_month_working_days', {
          month_date: monthDate
        })
      )

      if (error) throw error

      set(state => ({
        workingDays: {
          ...state.workingDays,
          [monthDate]: data || 0
        }
      }))
    } catch (error) {
      console.error('Error fetching working days:', error)
      // Don't set error state for missing data
      if (error instanceof Error && !error.message.includes('no rows')) {
        set({ error: error.message })
      }
    } finally {
      set({ loading: false })
    }
  },
  getWorkingDaysToDate: async (date: Date) => {
    const monthKey = format(date, 'yyyy-MM-dd')
    const totalWorkingDays = get().workingDays[monthKey] || 0
    
    try {
      const { data, error } = await supabase.rpc('calculate_working_days', {
        start_date: format(startOfMonth(date), 'yyyy-MM-dd'),
        end_date: format(date, 'yyyy-MM-dd')
      })

      if (error) {
        console.error('Error calculating working days:', error)
        return 0
      }
      
      return data || 0
    } catch (error) {
      console.error('Error calculating working days:', error)
      return 0
    }
  }
}))