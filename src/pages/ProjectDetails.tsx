import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useProjectsStore } from '../lib/store/projects'
import { useDailyLogsStore } from '../lib/store/dailyLogs'
import { useProfilesStore } from '../lib/store/profiles'
import { ProjectHeader } from '../components/project/ProjectHeader'
import { LogsView } from '../components/project/views/LogsView'
import { TeamView } from '../components/project/views/TeamView'
import { AllocationView } from '../components/project/views/AllocationView'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { toast } from 'react-hot-toast'
import { supabase } from '../lib/supabase/client'
import type { View, NewLog, UserProfile } from '../components/project/types'

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>()
  const [currentView, setCurrentView] = useState<View>('logs')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editProjectName, setEditProjectName] = useState('')
  const [editBudgets, setEditBudgets] = useState<Array<{
    month_date: string
    budget_amount: number
  }>>([])
  const [isAddTeamMemberModalOpen, setIsAddTeamMemberModalOpen] = useState(false)
  const [isLogTimeModalOpen, setIsLogTimeModalOpen] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([])
  const [newTeamMember, setNewTeamMember] = useState({
    userId: '',
    ratePerHour: ''
  })
  const [newLog, setNewLog] = useState<NewLog>({
    hours_spent: 1,
    work_description: [''],
    date: format(new Date(), 'yyyy-MM-dd')
  })

  const { 
    projects, 
    loading: projectsLoading, 
    fetchProjects, 
    updateProject, 
    updateProjectBudgets,
    addTeamMember,
    updateMonthlyAllocation,
    removeTeamMember 
  } = useProjectsStore()
  const { logs, loading: logsLoading, fetchLogs, createLog, updateLog, deleteLog } = useDailyLogsStore()
  const { profiles: userProfiles, fetchProfiles } = useProfilesStore()

  const project = id ? projects.find(p => p.id === id) : null

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  useEffect(() => {
    if (!project) return
    
    const userIds = project.users.map(u => u.user_id)
    if (userIds.length) {
      fetchProfiles(userIds)
    }
  }, [project, fetchProfiles])

  useEffect(() => {
    if (!id) return
    const start = startOfMonth(selectedDate)
    const end = endOfMonth(selectedDate)
    fetchLogs(id, start, end)
  }, [id, selectedDate, fetchLogs])

  useEffect(() => {
    if (!isAddTeamMemberModalOpen || !project) return

    const fetchAvailableUsers = async () => {
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .order('email')

        if (error) throw error

        const existingUserIds = new Set(project.users.map(u => u.user_id))
        const availableProfiles = profiles.filter(profile => !existingUserIds.has(profile.id))
        setAvailableUsers(availableProfiles)
      } catch (error) {
        console.error('Error fetching available users:', error)
        toast.error('Failed to load available users')
      }
    }

    fetchAvailableUsers()
  }, [isAddTeamMemberModalOpen, project])

  if (!project || projectsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const handlePreviousMonth = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() - 1)
      return newDate
    })
  }

  const handleNextMonth = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + 1)
      return newDate
    })
  }

  const handleEditProject = () => {
    setIsEditModalOpen(true)
    setEditProjectName(project.name)
    
    // Initialize budgets for the next 12 months
    const now = new Date()
    const budgets = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const monthDate = format(date, 'yyyy-MM-dd')
      const existingBudget = project.budgets.find(
        b => format(new Date(b.month_date), 'yyyy-MM') === format(date, 'yyyy-MM')
      )
      return {
        month_date: monthDate,
        budget_amount: existingBudget?.budget_amount || 0
      }
    })
    setEditBudgets(budgets)
  }

  const handleAddTeamMember = () => {
    setIsAddTeamMemberModalOpen(true)
  }

  const handleLogTime = () => {
    setIsLogTimeModalOpen(true)
  }

  const handleEditProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project) return

    try {
      // Update project name
      const updateNamePromise = updateProject(project.id, {
        name: editProjectName
      })
      
      // Update budgets
      const updateBudgetsPromise = updateProjectBudgets(
        project.id,
        editBudgets.filter(b => b.budget_amount > 0)
      )

      await Promise.all([updateNamePromise, updateBudgetsPromise])
      
      toast.success('Project updated successfully')
      setIsEditModalOpen(false)
    } catch (error) {
      toast.error('Failed to update project')
    }
  }

  const handleAddTeamMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project || !newTeamMember.userId) return

    try {
      await addTeamMember(project.id, {
        user_id: newTeamMember.userId,
        rate_per_hour: parseFloat(newTeamMember.ratePerHour)
      })

      toast.success('Team member added successfully')
      setIsAddTeamMemberModalOpen(false)
      setNewTeamMember({ userId: '', ratePerHour: '' })
    } catch (error) {
      toast.error('Failed to add team member')
    }
  }

  const handleLogTimeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project || !newLog.hours_spent || !newLog.work_description[0]) return

    try {
      await createLog({
        project_id: project.id,
        date: newLog.date,
        hours_spent: newLog.hours_spent,
        work_description: newLog.work_description.filter(desc => desc.trim())
      })

      toast.success('Time logged successfully')
      setIsLogTimeModalOpen(false)
      setNewLog({
        hours_spent: 1,
        work_description: [''],
        date: format(new Date(), 'yyyy-MM-dd')
      })
      
      // Refresh logs after creating a new one
      const start = startOfMonth(selectedDate)
      const end = endOfMonth(selectedDate)
      fetchLogs(project.id, start, end)
    } catch (error) {
      toast.error('Failed to log time')
    }
  }

  const handleDeleteLog = async (logId: string) => {
    try {
      await deleteLog(logId)
      toast.success('Log deleted successfully')
      
      // Refresh logs after deletion
      const start = startOfMonth(selectedDate)
      const end = endOfMonth(selectedDate)
      fetchLogs(project.id, start, end)
    } catch (error) {
      toast.error('Failed to delete log')
    }
  }

  const monthlyBudget = project.budgets.find(
    b => format(new Date(b.month_date), 'yyyy-MM') === format(selectedDate, 'yyyy-MM')
  )?.budget_amount || 0

  const totalSpent = logs.reduce((sum, log) => {
    const user = project.users.find(u => u.user_id === log.user_id)
    return sum + (log.hours_spent * (user?.rate_per_hour || 0))
  }, 0)

  const budgetProgress = {
    used: totalSpent,
    total: monthlyBudget,
    percentage: monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <ProjectHeader
            projectName={project.name}
            teamMemberCount={project.users.length}
            currentView={currentView}
            setCurrentView={setCurrentView}
            onEditClick={handleEditProject}
            onAddTeamMemberClick={handleAddTeamMember}
            onLogTimeClick={handleLogTime}
          />

          {currentView === 'logs' && (
            <LogsView
              selectedDate={selectedDate}
              onPreviousMonth={handlePreviousMonth}
              onNextMonth={handleNextMonth}
              allocatedHours={
                project.allocations
                  .filter(a => format(new Date(a.month_date), 'yyyy-MM') === format(selectedDate, 'yyyy-MM'))
                  .reduce((acc, allocation) => ({
                    ...acc,
                    [allocation.user_id]: allocation.allocated_hours
                  }), {})
              }
              userProfiles={userProfiles}
              budgetProgress={budgetProgress}
              logs={logs}
              loading={logsLoading}
              onEditLog={(log) => {
                // Handle edit log
                console.log('Edit log:', log)
              }}
              onDeleteLog={handleDeleteLog}
            />
          )}

          {currentView === 'team' && (
            <TeamView
              users={project.users}
              userProfiles={userProfiles}
              onEditMember={(userId) => {
                // Handle edit member
                console.log('Edit member:', userId)
              }}
              onDeleteMember={async (userId) => {
                try {
                  await removeTeamMember(project.id, userId)
                  toast.success('Team member removed successfully')
                } catch (error) {
                  toast.error('Failed to remove team member')
                }
              }}
            />
          )}

          {currentView === 'allocate' && (
            <AllocationView
              selectedDate={selectedDate}
              onPreviousMonth={handlePreviousMonth}
              onNextMonth={handleNextMonth}
              allocation={{
                totalBudget: monthlyBudget,
                teamRates: project.users.map(user => ({
                  userId: user.user_id,
                  rate: user.rate_per_hour,
                  name: userProfiles[user.user_id]?.full_name || userProfiles[user.user_id]?.email || user.user_id
                })),
                maxHours: project.users.reduce((acc, user) => ({
                  ...acc,
                  [user.user_id]: Math.floor(monthlyBudget / user.rate_per_hour)
                }), {}),
                allocatedHours: project.allocations
                  .filter(a => format(new Date(a.month_date), 'yyyy-MM') === format(selectedDate, 'yyyy-MM'))
                  .reduce((acc, allocation) => ({
                    ...acc,
                    [allocation.user_id]: allocation.allocated_hours
                  }), {}),
                remainingBudget: monthlyBudget - totalSpent
              }}
              onAllocationChange={async (allocations) => {
                if (!project) return
                const monthDate = format(selectedDate, 'yyyy-MM-dd')
                const updates = Object.entries(allocations).map(([userId, hours]) => 
                  updateMonthlyAllocation(project.id, userId, monthDate, hours)
                )

                try {
                  await Promise.all(updates)
                  toast.success('Allocation updated successfully')
                } catch (error) {
                  toast.error('Failed to update allocation')
                  throw error
                }
              }}
            />
          )}

          {/* Edit Project Modal */}
          {isEditModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h2 className="text-2xl font-bold mb-4">Edit Project</h2>
                <form onSubmit={handleEditProjectSubmit}>
                  <div className="space-y-6">
                    <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
                      Project Name
                    </label>
                    <input
                      type="text"
                      id="projectName"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      value={editProjectName}
                      onChange={(e) => setEditProjectName(e.target.value)}
                    />
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Monthly Budgets</h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {editBudgets.map((budget, index) => (
                          <div key={budget.month_date} className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500 w-32">
                              {format(new Date(budget.month_date), 'MMMM yyyy')}
                            </span>
                            <div className="flex-1">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                value={budget.budget_amount}
                                onChange={(e) => {
                                  const newBudgets = [...editBudgets]
                                  newBudgets[index] = {
                                    ...budget,
                                    budget_amount: parseFloat(e.target.value) || 0
                                  }
                                  setEditBudgets(newBudgets)
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Team Member Modal */}
          {isAddTeamMemberModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h2 className="text-2xl font-bold mb-4">Add Team Member</h2>
                <form onSubmit={handleAddTeamMemberSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                        Select User
                      </label>
                      <select
                        id="userId"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={newTeamMember.userId}
                        onChange={(e) => setNewTeamMember(prev => ({ ...prev, userId: e.target.value }))}
                      >
                        <option value="">Select a user...</option>
                        {availableUsers.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.full_name ? `${user.full_name} (${user.email})` : user.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="rate" className="block text-sm font-medium text-gray-700">
                        Rate per Hour ($)
                      </label>
                      <input
                        type="number"
                        id="rate"
                        required
                        min="0"
                        step="0.01"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={newTeamMember.ratePerHour}
                        onChange={(e) => setNewTeamMember(prev => ({ ...prev, ratePerHour: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddTeamMemberModalOpen(false)
                        setNewTeamMember({ userId: '', ratePerHour: '' })
                      }}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Add Member
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Log Time Modal */}
          {isLogTimeModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h2 className="text-2xl font-bold mb-4">Log Time</h2>
                <form onSubmit={handleLogTimeSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                        Date
                      </label>
                      <input
                        type="date"
                        id="date"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={newLog.date}
                        onChange={(e) => setNewLog(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label htmlFor="hours" className="block text-sm font-medium text-gray-700">
                        Hours Spent
                      </label>
                      <input
                        type="number"
                        id="hours"
                        required
                        min="0.1"
                        step="0.1"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={newLog.hours_spent}
                        onChange={(e) => setNewLog(prev => ({ ...prev, hours_spent: parseFloat(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Work Description
                      </label>
                      {newLog.work_description.map((desc, index) => (
                        <div key={index} className="mt-1 flex space-x-2">
                          <input
                            type="text"
                            required
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            value={desc}
                            onChange={(e) => {
                              const newDesc = [...newLog.work_description]
                              newDesc[index] = e.target.value
                              setNewLog(prev => ({ ...prev, work_description: newDesc }))
                            }}
                          />
                          {index === newLog.work_description.length - 1 ? (
                            <button
                              type="button"
                              onClick={() => setNewLog(prev => ({
                                ...prev,
                                work_description: [...prev.work_description, '']
                              }))}
                              className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              +
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                const newDesc = newLog.work_description.filter((_, i) => i !== index)
                                setNewLog(prev => ({ ...prev, work_description: newDesc }))
                              }}
                              className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              -
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogTimeModalOpen(false)
                        setNewLog({
                          hours_spent: 1,
                          work_description: [''],
                          date: format(new Date(), 'yyyy-MM-dd')
                        })
                      }}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Log Time
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}