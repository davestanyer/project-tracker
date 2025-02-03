import { create } from 'zustand'
import { supabase } from '../supabase/client'
import type { Database } from '../supabase/types'

type Project = Database['public']['Tables']['projects']['Row']
type ProjectBudget = Database['public']['Tables']['project_budgets']['Row']
type ProjectUser = Database['public']['Tables']['project_users']['Row']
type MonthlyAllocation = Database['public']['Tables']['monthly_allocations']['Row']

type ProjectWithDetails = Project & {
  users: ProjectUser[]
  budgets: ProjectBudget[]
  allocations: MonthlyAllocation[]
}

interface ProjectsState {
  projects: ProjectWithDetails[]
  loading: boolean
  error: string | null
  fetchProjects: () => Promise<void>
  createProject: (data: {
    name: string
    users: Array<{
      user_id: string
      rate_per_hour: number
    }>
  }) => Promise<void>
  updateProject: (id: string, data: {
    name: string
  }) => Promise<void>
  updateProjectBudgets: (projectId: string, budgets: Array<{
    month_date: string
    budget_amount: number
  }>) => Promise<void>
  addTeamMember: (projectId: string, data: {
    user_id: string
    rate_per_hour: number
  }) => Promise<void>
  updateTeamMember: (projectId: string, userId: string, data: {
    rate_per_hour: number
  }) => Promise<void>
  removeTeamMember: (projectId: string, userId: string) => Promise<void>
  updateMonthlyAllocation: (projectId: string, userId: string, monthDate: string, hours: number) => Promise<void>
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  loading: false,
  error: null,
  fetchProjects: async () => {
    set({ loading: true, error: null })
    try {
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
      
      if (projectsError) throw projectsError

      const projectsWithDetails = await Promise.all(
        projects.map(async (project) => {
          const { data: users } = await supabase
            .from('project_users')
            .select('*')
            .eq('project_id', project.id)

          const { data: budgets } = await supabase
            .from('project_budgets')
            .select('*')
            .eq('project_id', project.id)
            .order('month_date', { ascending: true })

          const { data: allocations } = await supabase
            .from('monthly_allocations')
            .select('*')
            .eq('project_id', project.id)
            .order('month_date', { ascending: true })
          
          return {
            ...project,
            users: users || [],
            budgets: budgets || [],
            allocations: allocations || []
          }
        })
      )

      set({ projects: projectsWithDetails })
    } catch (error) {
      set({ error: (error as Error).message })
    } finally {
      set({ loading: false })
    }
  },
  createProject: async ({ name, users }) => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([{ 
          name,
          created_by: user.id 
        }])
        .select()
        .single()

      if (projectError) throw projectError

      const projectUsers = users.map((user) => ({
        ...user,
        project_id: project.id,
      }))

      if (projectUsers.length > 0) {
        const { error: usersError } = await supabase
          .from('project_users')
          .insert(projectUsers)

        if (usersError) throw usersError
      }

      get().fetchProjects()
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    } finally {
      set({ loading: false })
    }
  },
  updateProject: async (id, { name }) => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase
        .from('projects')
        .update({ name })
        .eq('id', id)

      if (error) throw error
      get().fetchProjects()
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    } finally {
      set({ loading: false })
    }
  },
  updateProjectBudgets: async (projectId, budgets) => {
    set({ loading: true, error: null })
    try {
      // First, delete existing budgets for the given months
      const monthDates = budgets.map(b => b.month_date)
      await supabase
        .from('project_budgets')
        .delete()
        .eq('project_id', projectId)
        .in('month_date', monthDates)

      // Then insert new budgets
      const { error } = await supabase
        .from('project_budgets')
        .insert(budgets.map(budget => ({
          project_id: projectId,
          month_date: budget.month_date,
          budget_amount: budget.budget_amount
        })))

      if (error) throw error
      get().fetchProjects()
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    } finally {
      set({ loading: false })
    }
  },
  addTeamMember: async (projectId, { user_id, rate_per_hour }) => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase
        .from('project_users')
        .insert([{
          project_id: projectId,
          user_id,
          rate_per_hour
        }])

      if (error) throw error
      get().fetchProjects()
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    } finally {
      set({ loading: false })
    }
  },
  updateTeamMember: async (projectId, userId, { rate_per_hour }) => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase
        .from('project_users')
        .update({
          rate_per_hour
        })
        .eq('project_id', projectId)
        .eq('user_id', userId)

      if (error) throw error
      get().fetchProjects()
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    } finally {
      set({ loading: false })
    }
  },
  removeTeamMember: async (projectId, userId) => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase
        .from('project_users')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId)

      if (error) throw error
      get().fetchProjects()
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    } finally {
      set({ loading: false })
    }
  },
  updateMonthlyAllocation: async (projectId, userId, monthDate, hours) => {
    set({ loading: true, error: null })
    try {
      if (hours > 0) {
        // Upsert allocation
        const { error } = await supabase
          .from('monthly_allocations')
          .upsert([{
            project_id: projectId,
            user_id: userId,
            month_date: monthDate,
            allocated_hours: hours
          }], {
            onConflict: 'project_id,user_id,month_date'
          })

        if (error) throw error
      } else {
        // Delete allocation if hours is 0
        const { error } = await supabase
          .from('monthly_allocations')
          .delete()
          .eq('project_id', projectId)
          .eq('user_id', userId)
          .eq('month_date', monthDate)

        if (error) throw error
      }

      get().fetchProjects()
    } catch (error) {
      console.error('Failed to update allocation:', error)
      set({ error: error instanceof Error ? error.message : 'Failed to update allocation' })
      throw error
    } finally {
      set({ loading: false })
    }
  }
}))