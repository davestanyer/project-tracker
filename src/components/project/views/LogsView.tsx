import { useEffect, useState } from 'react'
import { format, isSameMonth } from 'date-fns'
import { Pencil, Trash2 } from 'lucide-react'
import { useWorkingDaysStore } from '../../../lib/store/workingDays'
import { MonthNavigation } from '../MonthNavigation'
import { BudgetProgress } from '../BudgetProgress'
import type { NewLog, UserProfile } from '../types'

type AllocatedHours = Record<string, number>

type LogsViewProps = {
  selectedDate: Date
  onPreviousMonth: () => void
  onNextMonth: () => void
  budgetProgress: {
    used: number
    total: number
    percentage: number
  }
  userProfiles: Record<string, UserProfile>
  allocatedHours: AllocatedHours
  logs: Array<{
    id: string
    date: string
    user_id: string
    hours_spent: number
    work_description: string[]
  }>
  loading: boolean
  onEditLog: (log: { id: string } & NewLog) => void
  onDeleteLog: (id: string) => void
}

export function LogsView({
  selectedDate,
  onPreviousMonth,
  onNextMonth,
  allocatedHours,
  budgetProgress,
  userProfiles,
  logs,
  loading,
  onEditLog,
  onDeleteLog
}: LogsViewProps) {
  const { workingDays, fetchWorkingDays } = useWorkingDaysStore()

  useEffect(() => {
    const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    fetchWorkingDays(firstDayOfMonth)
  }, [selectedDate, fetchWorkingDays])

  const today = new Date()
  const monthDate = format(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1), 'yyyy-MM-dd')
  const workingDaysCount = workingDays[monthDate] || 0
  const isCurrentMonth = isSameMonth(selectedDate, today)

  // Get working days to date for current month
  const [elapsedWorkingDays, setElapsedWorkingDays] = useState(0)

  useEffect(() => {
    async function updateElapsedDays() {
      if (isCurrentMonth) {
        const currentDate = today
        currentDate.setHours(23, 59, 59, 999)
        const days = await useWorkingDaysStore.getState().getWorkingDaysToDate(currentDate)
        setElapsedWorkingDays(days)
      } else {
        setElapsedWorkingDays(workingDaysCount)
      }
    }
    updateElapsedDays()
  }, [isCurrentMonth, workingDaysCount, today])

  // Calculate monthly totals per user
  const userTotals = logs.reduce((acc, log) => {
    const userId = log.user_id
    acc[userId] = (acc[userId] || 0) + log.hours_spent
    return acc
  }, {} as Record<string, number>)

  const getUserDisplayName = (userId: string) => {
    const profile = userProfiles[userId]
    return profile?.full_name || profile?.email || 'Unknown User'
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <MonthNavigation
          selectedDate={selectedDate}
          onPreviousMonth={onPreviousMonth}
          onNextMonth={onNextMonth}
          budgetAmount={budgetProgress.total}
        />
        <BudgetProgress {...budgetProgress} />
      </div>

      {/* Monthly User Totals */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Totals</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-gray-500">Today</div>
              <div className="font-medium">{format(today, 'EEEE, dd MMMM yyyy')}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-gray-500">Working Days</div>
              <div className="font-medium">
                {isCurrentMonth ? `${elapsedWorkingDays}/${workingDaysCount}` : `${workingDaysCount} days`}
              </div>
            </div>
          </div>
          {Object.entries(userTotals).map(([userId, hours]) => (
            <div key={userId} className="flex justify-between items-center py-3 border-t">
              <div>
                {getUserDisplayName(userId)}
                <div className="text-sm text-gray-500">
                  {workingDaysCount > 0 && (
                    <>
                      Target: {allocatedHours[userId] || 0} hours
                      {isCurrentMonth && elapsedWorkingDays > 0 && (
                        <span className={`ml-2 ${
                          hours >= ((allocatedHours[userId] || 0) * elapsedWorkingDays / workingDaysCount)
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          ({hours >= ((allocatedHours[userId] || 0) * elapsedWorkingDays / workingDaysCount) ? '+' : '-'}
                          {Math.abs(hours - ((allocatedHours[userId] || 0) * elapsedWorkingDays / workingDaysCount)).toFixed(1)} hours from target)
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">{hours} hours</div>
                <div className="text-sm text-gray-500">
                  {workingDaysCount > 0 && elapsedWorkingDays > 0
                    ? `${(hours / elapsedWorkingDays).toFixed(1)} of ${((allocatedHours[userId] || 0) / workingDaysCount).toFixed(1)} hours/day`
                    : '—'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="border-b pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {format(new Date(log.date), 'EEEE, dd MMMM yyyy')}
                        <span className="ml-2 text-gray-500">
                          by {getUserDisplayName(log.user_id)}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        {log.hours_spent} hours
                      </p>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="text-sm text-gray-500">
                        {log.work_description.map((desc, i) => (
                          <p key={i}>{desc}</p>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onEditLog(log)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteLog(log.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}