import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLucideIcons } from '../../../utils/lucideIcons'

type Stats = {
  totalAdmins: number
  activeAdmins: number
  suspendedAdmins: number
  superAdmins: number
  adminsByGroup: Record<string, number>
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats>({
    totalAdmins: 0,
    activeAdmins: 0,
    suspendedAdmins: 0,
    superAdmins: 0,
    adminsByGroup: {}
  })
  const [loading, setLoading] = useState(true)

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
  const adminRaw = localStorage.getItem('admin')
  const currentAdmin = adminRaw ? JSON.parse(adminRaw) : {}

  useEffect(() => {
    // Check if user is super admin
    if (currentAdmin?.role !== 'super-admin') {
      navigate('/admin/dashboard')
      return
    }
    fetchStats()
    useLucideIcons()
  }, [navigate, currentAdmin])

  const fetchStats = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/admin/super-admins`, {
        headers: {
          'X-Admin-Email': currentAdmin?.email || '',
          'X-Admin-Group': currentAdmin?.adminGroup || ''
        }
      })
      const data = await response.json()
      if (data.success && data.admins) {
        const admins = data.admins
        const totalAdmins = admins.length
        const activeAdmins = admins.filter((a: any) => a.isApproved).length
        const suspendedAdmins = admins.filter((a: any) => !a.isApproved).length
        const superAdmins = admins.filter((a: any) => a.role === 'super-admin').length
        
        // Count by group
        const adminsByGroup: Record<string, number> = {}
        admins.forEach((admin: any) => {
          const group = admin.adminGroup || 'unknown'
          adminsByGroup[group] = (adminsByGroup[group] || 0) + 1
        })

        setStats({
          totalAdmins,
          activeAdmins,
          suspendedAdmins,
          superAdmins,
          adminsByGroup
        })
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const groupLabels: Record<string, string> = {
    'choir': 'Choir',
    'anointed': 'Anointed',
    'abanyamugisha': 'Abanyamugisha',
    'psalm23': 'Psalm 23',
    'psalm46': 'Psalm 46',
    'protocol': 'Protocol',
    'social': 'Social',
    'evangelical': 'Evangelical'
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Super Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage all administrators across the CEP system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Admins</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalAdmins}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <i data-lucide="users" className="w-8 h-8 text-blue-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Admins</p>
              <p className="text-3xl font-bold text-green-800 mt-2">{stats.activeAdmins}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <i data-lucide="check-circle" className="w-8 h-8 text-green-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Suspended Admins</p>
              <p className="text-3xl font-bold text-red-800 mt-2">{stats.suspendedAdmins}</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <i data-lucide="ban" className="w-8 h-8 text-red-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Super Admins</p>
              <p className="text-3xl font-bold text-purple-800 mt-2">{stats.superAdmins}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <i data-lucide="shield-check" className="w-8 h-8 text-purple-600"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/admin/super-admins')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <i data-lucide="users" className="w-6 h-6 text-blue-600 mr-3"></i>
            <div className="text-left">
              <p className="font-semibold text-gray-800">Manage All Admins</p>
              <p className="text-sm text-gray-600">View, create, and manage admin accounts</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/super-admins')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors"
          >
            <i data-lucide="user-plus" className="w-6 h-6 text-green-600 mr-3"></i>
            <div className="text-left">
              <p className="font-semibold text-gray-800">Create New Admin</p>
              <p className="text-sm text-gray-600">Add a new admin account</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/super-admins')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors"
          >
            <i data-lucide="settings" className="w-6 h-6 text-purple-600 mr-3"></i>
            <div className="text-left">
              <p className="font-semibold text-gray-800">System Settings</p>
              <p className="text-sm text-gray-600">Configure system preferences</p>
            </div>
          </button>
        </div>
      </div>

      {/* Admins by Group */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Admins by Group</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats.adminsByGroup).map(([group, count]) => (
            <div key={group} className="border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">{count}</p>
              <p className="text-sm text-gray-600 mt-1">{groupLabels[group] || group}</p>
            </div>
          ))}
          {Object.keys(stats.adminsByGroup).length === 0 && (
            <p className="col-span-full text-center text-gray-500 py-4">No admin groups found</p>
          )}
        </div>
      </div>
    </div>
  )
}

