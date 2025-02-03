type BudgetProgressProps = {
  used: number
  total: number
  percentage: number
}

export function BudgetProgress({ used, total, percentage }: BudgetProgressProps) {
  return (
    <div className="relative pt-1">
      <div className="flex mb-2 items-center justify-between">
        <div>
          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
            {percentage.toFixed(1)}% Used
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold inline-block text-blue-600">
            ${used.toFixed(2)} / ${total.toFixed(2)}
          </span>
        </div>
      </div>
      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
        <div
          style={{ width: `${Math.min(percentage, 100)}%` }}
          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
            percentage > 100 ? 'bg-red-500' : 'bg-blue-500'
          }`}
        />
      </div>
    </div>
  )
}