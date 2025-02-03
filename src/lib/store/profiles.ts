import { create } from 'zustand'
import { supabase } from '../supabase/client'
import type { Database } from '../supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface ProfilesState {
  profiles: Record<string, Profile>
  loading: boolean
  error: string | null
  fetchProfiles: (userIds: string[]) => Promise<void>
}

export const useProfilesStore = create<ProfilesState>((set, get) => ({
  profiles: {},
  loading: false,
  error: null,
  fetchProfiles: async (userIds: string[]) => {
    if (!userIds.length) return

    set({ loading: true, error: null })
    
    const maxRetries = 3
    let retryCount = 0
    
    while (retryCount < maxRetries) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .in('id', userIds)

        if (error) throw error

        const profilesMap = (data || []).reduce((acc, profile) => ({
          ...acc,
          [profile.id]: profile
        }), {})

        set({ 
          profiles: { ...get().profiles, ...profilesMap },
          loading: false,
          error: null
        })
        
        return
      } catch (error) {
        retryCount++
        if (retryCount === maxRetries) {
          console.error('Failed to fetch profiles after retries:', error)
          set({ 
            error: 'Failed to load user profiles. Please try again later.',
            loading: false
          })
        } else {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
        }
      }
    }
  }
}))