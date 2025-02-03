import { format } from 'date-fns'
import { MonthNavigation } from '../MonthNavigation'
import { Save, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useWorkingDaysStore } from '../../../lib/store/workingDays'

type AllocationViewProps = {
  selectedDate: Date
  onPreviousMonth: () => void
  onNextMonth: () => void
  allocation: {
    totalBudget: number
    teamRates: Array<{
      userId: string
      rate: number
      name: string
    }>
    maxHours: Record<string, number>
    allocatedHours: Record<string, number>
    remainingBudget: number
  } | null
  onAllocationChange: (allocations: Record<string, number>) => Promise<void>
}

export function AllocationView({
  selectedDate,
  onPreviousMonth,
  onNextMonth,
  allocation,
  onAllocationChange
}: AllocationViewProps) {
  const [pendingAllocations, setPendingAllocations] = useState<Record<string, number>>(
    allocation?.allocatedHours || {}
  )
  const [saving, setSaving] = useState(false)
  const { workingDays, fetchWorkingDays } = useWorkingDaysStore()

  useEffect(() => {
    const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    fetchWorkingDays(firstDayOfMonth)
  }, [selectedDate, fetchWorkingDays])

  const monthDate = format(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1), 'yyyy-MM-dd')
  const workingDaysCount = workingDays[monthDate] || 0

  const today = new Date()

  // Calculate total cost and remaining budget based on pending allocations
  const totalCost = allocation?.teamRates.reduce((sum, { userId, rate }) => {
    return sum + (pendingAllocations[userId] || 0) * rate
  }, 0) || 0

  const remainingBudget = allocation ? allocation.totalBudget - totalCost : 0

  const handleSave = async () => {
    if (!allocation) return
    setSaving(true)
    const currentMonth = format(selectedDate, 'yyyy-MM-dd')
    try {
      // Filter out zero allocations to avoid unnecessary database entries
      const nonZeroAllocations = Object.fromEntries(
        Object.entries(pendingAllocations).filter(([_, hours]) => hours > 0)
      )
      await onAllocationChange(nonZeroAllocations)
    } catch (error) {
      console.error('Failed to update allocations:', error)
      throw error
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = JSON.stringify(pendingAllocations) !== JSON.stringify(allocation?.allocatedHours || {})

  if (!allocation) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
        <div className="px-4 py-5 sm:p-6">
          <MonthNavigation
            selectedDate={selectedDate}
            onPreviousMonth={onPreviousMonth}
            onNextMonth={onNextMonth}
          />
          <div className="text-center py-6 text-gray-500">
            No budget set for this month
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
      <div className="px-4 py-5 sm:p-6">
        <div className="mb-6">
          <MonthNavigation
            selectedDate={selectedDate}
            onPreviousMonth={onPreviousMonth}
            onNextMonth={onNextMonth}
          />
          <div className="flex justify-end mb-4">
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                hasChanges
                  ? 'border-transparent text-white bg-blue-600 hover:bg-blue-700'
                  : 'border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed'
              }`}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-blue-700">Monthly Budget</div>
                  <div className="font-medium text-blue-900">${allocation.totalBudget}</div>
                </div>
                <div>
                  <div className="text-blue-700">Remaining</div>
                  <div className={`font-medium ${
                    remainingBudget < 0 ? 'text-red-600' : 'text-blue-900'
                  }`}>
                    ${remainingBudget.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-blue-700">Today</div>
                  <div className="font-medium text-blue-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {format(today, 'dd MMM yyyy')}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {allocation.teamRates.map(({ userId, rate, name }) => (
                <div key={userId} className="border-b pb-4">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <span className="font-medium text-gray-900">{name}</span>
                      <div className="text-sm text-gray-500 mt-1">
                        ${rate}/hour • {workingDaysCount > 0 ? (
                          <span>
                            Daily Target: {((pendingAllocations[userId] || 0) / workingDaysCount).toFixed(1)} hours
                          </span>
                        ) : 'No working days set'}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500">${rate}/hour</span>
                      <div className="text-sm text-gray-500 mt-1">
                        {workingDaysCount > 0 ? `${workingDaysCount} working days` : 'No working days set'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="0"
                      max={allocation.maxHours[userId]}
                      value={pendingAllocations[userId] || 0}
                      onChange={(e) => {
                        setPendingAllocations(prev => ({
                          ...prev,
                          [userId]: parseInt(e.target.value)
                        }))
                      }}
                      className={`flex-grow ${remainingBudget < 0 ? 'accent-red-500' : 'accent-blue-500'}`}
                    />
                    <div className="w-20">
                      <input
                        type="number"
                        min="0"
                        max={allocation.maxHours[userId]}
                        value={pendingAllocations[userId] || 0}
                        onChange={(e) => {
                          setPendingAllocations(prev => ({
                            ...prev,
                            [userId]: parseInt(e.target.value)
                          }))
                        }}
                        className={`w-full rounded-md shadow-sm sm:text-sm ${
                          remainingBudget < 0 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                      />
                    </div>
                    <div className="w-24 text-right text-gray-500">
                      ${((pendingAllocations[userId] || 0) * rate).toFixed(2)}
                    </div>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    Maximum hours: {allocation.maxHours[userId]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}