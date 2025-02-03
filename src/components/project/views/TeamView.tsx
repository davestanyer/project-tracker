import { Pencil, Trash2 } from 'lucide-react'
import type { UserProfile } from '../types'

type TeamViewProps = {
  users: Array<{
    user_id: string
    rate_per_hour: number
    monthly_hours_budget: number
  }>
  userProfiles: Record<string, UserProfile>
  onEditMember: (userId: string) => void
  onDeleteMember: (userId: string) => void
}

export function TeamView({
  users,
  userProfiles,
  onEditMember,
  onDeleteMember
}: TeamViewProps) {
  const getUserDisplayName = (userId: string) => {
    const profile = userProfiles[userId]
    if (!profile) return userId
    return profile.full_name || profile.email || userId
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
      <div className="px-4 py-5 sm:p-6">
        <div className="space-y-6">
          {users.map((user) => (
            <div key={user.user_id} className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {getUserDisplayName(user.user_id)}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Rate: ${user.rate_per_hour}/hour
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEditMember(user.user_id)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDeleteMember(user.user_id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}