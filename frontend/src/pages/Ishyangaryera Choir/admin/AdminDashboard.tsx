import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLucideIcons } from '../../../utils/lucideIcons'
import { getApiBaseUrl } from '../../../utils/api'

type DashboardStats = {
  members: number
  songs: number
  events: number
  ideas: number
  donations: number
}

type RecentActivity = {
  _id: string
  activity: string
  createdAt: string
  adminId: { name: string }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({ members: 0, songs: 0, events: 0, ideas: 0, donations: 0 })
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  const baseUrl = getApiBaseUrl()
  const adminGroup = (() => {
    try {
      const raw = localStorage.getItem('admin')
      if (!raw) return 'choir'
      const obj = JSON.parse(raw)
      return obj?.adminGroup || 'choir'
    } catch { return 'choir' }
  })()
  const groupSuffix = `?group=${adminGroup}`
  const adminPathBase = '/admin'

  useEffect(() => {
    const adminRaw = localStorage.getItem('admin')
    const admin = adminRaw ? JSON.parse(adminRaw) : {}
    fetch(`${baseUrl}/api/admin/dashboard${groupSuffix}`, { headers: { 'X-Admin-Group': adminGroup, 'X-Admin-Email': admin?.email || '' } })
      .then(r => r.json())
      .then(data => {
        setStats(data.stats)
        setActivities(data.recentActivities || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useLucideIcons()

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex space-x-4">
          <Link to={`${adminPathBase}/events`} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center">
            <i data-lucide="calendar" className="w-4 h-4 mr-2"></i> Manage Events
          </Link>
          <Link to={`${adminPathBase}/members`} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center">
            <i data-lucide="users" className="w-4 h-4 mr-2"></i> Manage Members
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <i data-lucide="users" className="w-6 h-6"></i>
            </div>
            <div>
              <p className="text-gray-600">Total Members</p>
              <h3 className="text-2xl font-bold">{stats.members}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <i data-lucide="music" className="w-6 h-6"></i>
            </div>
            <div>
              <p className="text-gray-600">Total Songs</p>
              <h3 className="text-2xl font-bold">{stats.songs}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <i data-lucide="calendar" className="w-6 h-6"></i>
            </div>
            <div>
              <p className="text-gray-600">Upcoming Events</p>
              <h3 className="text-2xl font-bold">{stats.events}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <i data-lucide="lightbulb" className="w-6 h-6"></i>
            </div>
            <div>
              <p className="text-gray-600">Pending Ideas</p>
              <h3 className="text-2xl font-bold">{stats.ideas}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <i data-lucide="activity" className="mr-2 text-blue-600"></i> Recent Activities
          </h3>
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-gray-500">No recent activities</p>
            ) : (
              activities.map(activity => (
                <div key={activity._id} className="border-b pb-3">
                  <p className="font-medium">{activity.activity}</p>
                  <p className="text-sm text-gray-600">
                    by {activity.adminId?.name || 'Unknown'} • {new Date(activity.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <i data-lucide="settings" className="mr-2 text-green-600"></i> Quick Actions
          </h3>
          <div className="space-y-3">
            <Link to={`${adminPathBase}/events`} className="block w-full bg-blue-50 hover:bg-blue-100 text-blue-800 p-3 rounded-lg transition">
              <i data-lucide="calendar" className="inline w-4 h-4 mr-2"></i> Manage Events
            </Link>
            <Link to={`${adminPathBase}/songs`} className="block w-full bg-green-50 hover:bg-green-100 text-green-800 p-3 rounded-lg transition">
              <i data-lucide="music" className="inline w-4 h-4 mr-2"></i> Manage Songs
            </Link>
            <Link to={`${adminPathBase}/members`} className="block w-full bg-purple-50 hover:bg-purple-100 text-purple-800 p-3 rounded-lg transition">
              <i data-lucide="users" className="inline w-4 h-4 mr-2"></i> Manage Members
            </Link>
            <Link to={`${adminPathBase}/ideas`} className="block w-full bg-yellow-50 hover:bg-yellow-100 text-yellow-800 p-3 rounded-lg transition">
              <i data-lucide="lightbulb" className="inline w-4 h-4 mr-2"></i> Review Ideas
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <i data-lucide="info" className="mr-2 text-purple-600"></i> System Info
          </h3>
          <div className="space-y-2 text-sm">
            <p><strong>Admin Panel:</strong> Ishyanga Ryera Choir</p>
            <p><strong>Version:</strong> 1.0.0</p>
            <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span className="text-green-600">Online</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}






