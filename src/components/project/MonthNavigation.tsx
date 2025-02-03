import { format } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type MonthNavigationProps = {
  selectedDate: Date
  onPreviousMonth: () => void
  onNextMonth: () => void
  budgetAmount?: number
}

export function MonthNavigation({
  selectedDate,
  onPreviousMonth,
  onNextMonth,
  budgetAmount
}: MonthNavigationProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center space-x-4">
        <button
          onClick={onPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-medium text-gray-900">
          {format(selectedDate, 'MMMM yyyy')}
        </h2>
        <button
          onClick={onNextMonth}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      {budgetAmount !== undefined && (
        <div className="text-sm font-medium text-gray-500">
          Budget: ${budgetAmount.toFixed(2)}
        </div>
      )}
    </div>
  )
}