import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, Clock, Users, Calculator, Settings, UserPlus, LogOut } from 'lucide-react'
import { useAuthStore } from '../../lib/store/auth'
import type { View } from './types'

type ProjectHeaderProps = {
  projectName: string
  teamMemberCount: number
  currentView: View
  setCurrentView: (view: View) => void
  onEditClick: () => void
  onAddTeamMemberClick: () => void
  onLogTimeClick: () => void
}

export function ProjectHeader({
  projectName,
  teamMemberCount,
  currentView,
  setCurrentView,
  onEditClick,
  onAddTeamMemberClick,
  onLogTimeClick
}: ProjectHeaderProps) {
  const navigate = useNavigate()
  const { signOut } = useAuthStore()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-5 w-5" />
          Back to Dashboard
        </Link>
        <button
          onClick={handleSignOut}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{projectName}</h1>
          <div className="mt-2 flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Team Members: <span className="font-medium">{teamMemberCount}</span>
            </span>
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentView('logs')}
            className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
              currentView === 'logs'
                ? 'border-transparent text-white bg-blue-600 hover:bg-blue-700'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <Clock className="h-5 w-5 mr-2" />
            Logs
          </button>
          <button
            onClick={() => setCurrentView('team')}
            className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
              currentView === 'team'
                ? 'border-transparent text-white bg-blue-600 hover:bg-blue-700'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <Users className="h-5 w-5 mr-2" />
            Team
          </button>
          <button
            onClick={() => setCurrentView('allocate')}
            className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
              currentView === 'allocate'
                ? 'border-transparent text-white bg-blue-600 hover:bg-blue-700'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <Calculator className="h-5 w-5 mr-2" />
            Allocate Hours
          </button>
          <button
            onClick={onEditClick}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Settings className="h-5 w-5 mr-2" />
            Edit Project
          </button>
          {currentView === 'logs' ? (
            <button
              onClick={onLogTimeClick}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Clock className="h-5 w-5 mr-2" />
              Log Time
            </button>
          ) : currentView === 'team' ? (
            <button
              onClick={onAddTeamMemberClick}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Add Team Member
            </button>
          ) : null}
        </div>
      </div>
    </>
  )
}