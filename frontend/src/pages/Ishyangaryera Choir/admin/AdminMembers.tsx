import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLucideIcons } from '../../../utils/lucideIcons'

type Member = {
  _id: string
  email: string
  username: string
  profileImage?: string
  createdAt: string
  isApproved?: boolean
  approvedAt?: string
  approvedBy?: string
}

export default function AdminMembers() {
  const [members, setMembers] = useState<Member[]>([])
  const [pendingMembers, setPendingMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('pending')
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
  const adminGroup = (() => {
    try {
      const raw = localStorage.getItem('admin')
      if (!raw) return 'choir'
      const obj = JSON.parse(raw)
      return obj?.adminGroup || 'choir'
    } catch { return 'choir' }
  })()
  const groupQuery = adminGroup === 'anointed' ? 'group=anointed' : adminGroup === 'abanyamugisha' ? 'group=abanyamugisha' : adminGroup === 'psalm23' ? 'group=psalm23' : adminGroup === 'psalm46' ? 'group=psalm46' : adminGroup === 'protocol' ? 'group=protocol' : adminGroup === 'social' ? 'group=social' : adminGroup === 'evangelical' ? 'group=evangelical' : 'group=choir'

  useEffect(() => {
    fetchMembers()
    fetchPendingMembers()
  }, [])

  useLucideIcons()

  const fetchMembers = async () => {
    try {
    const adminRaw = localStorage.getItem('admin')
    const admin = adminRaw ? JSON.parse(adminRaw) : {}
    const response = await fetch(`${baseUrl}/api/admin/members?${groupQuery}`, { headers: { 'X-Admin-Group': adminGroup, 'X-Admin-Email': admin?.email || '' } })
      const data = await response.json()
      setMembers(data)
    } catch (error) {
      console.error('Failed to fetch members:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingMembers = async () => {
    try {
    const adminRaw = localStorage.getItem('admin')
    const admin = adminRaw ? JSON.parse(adminRaw) : {}
    const response = await fetch(`${baseUrl}/api/admin/members/pending?${groupQuery}`, { headers: { 'X-Admin-Group': adminGroup, 'X-Admin-Email': admin?.email || '' } })
      const data = await response.json()
      setPendingMembers(data)
    } catch (error) {
      console.error('Failed to fetch pending members:', error)
    }
  }

  const handleApprove = async (member: Member) => {
    try {
      const adminUsername = sessionStorage.getItem('adminUser') || 'admin'
      const adminRaw = localStorage.getItem('admin')
      const admin = adminRaw ? JSON.parse(adminRaw) : {}
      const response = await fetch(`${baseUrl}/api/admin/members/${member._id}/approve?${groupQuery}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Group': adminGroup, 'X-Admin-Email': admin?.email || '' },
        body: JSON.stringify({ approvedBy: adminUsername })
      })

      if (response.ok) {
        alert('User approved successfully!')
        fetchMembers()
        fetchPendingMembers()
      }
    } catch (error) {
      console.error('Failed to approve user:', error)
      alert('Failed to approve user')
    }
  }

  const handleReject = async (member: Member) => {
    const action = member.isApproved ? 'revoke approval for' : 'reject'
    if (!confirm(`Are you sure you want to ${action} this user?`)) return
    
    try {
      const adminRaw = localStorage.getItem('admin')
      const admin = adminRaw ? JSON.parse(adminRaw) : {}
      const response = await fetch(`${baseUrl}/api/admin/members/${member._id}/reject?${groupQuery}`, {
        method: 'POST'
      , headers: { 'X-Admin-Group': adminGroup, 'X-Admin-Email': admin?.email || '' } })

      if (response.ok) {
        alert(member.isApproved ? 'User approval revoked successfully!' : 'User rejected successfully!')
        fetchMembers()
        fetchPendingMembers()
      }
    } catch (error) {
      console.error('Failed to reject user:', error)
      alert('Failed to reject user')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="h-12 bg-gray-200"></div>
            {[1,2,3].map(i => (
              <div key={i} className="h-16 bg-gray-100 border-t"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const displayMembers = activeTab === 'pending' ? pendingMembers : members

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Manage Members</h1>
        
        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'pending'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending Approval ({pendingMembers.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All Members ({members.length})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayMembers.map(member => (
                <tr key={member._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {member.profileImage ? (
                        <img src={member.profileImage} alt={member.username} className="h-10 w-10 rounded-full mr-3" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                          <i data-lucide="user" className="w-5 h-5 text-gray-600"></i>
                        </div>
                      )}
                      <div className="text-sm font-medium text-gray-900">{member.username}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{member.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {member.isApproved ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {!member.isApproved ? (
                        <>
                          <button
                            onClick={() => handleApprove(member)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                            title="Approve user"
                          >
                            <i data-lucide="check-circle" className="w-4 h-4 mr-1"></i>
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(member)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                            title="Reject user"
                          >
                            <i data-lucide="x-circle" className="w-4 h-4 mr-1"></i>
                            Reject
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleReject(member)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
                          title="Revoke approval"
                        >
                          <i data-lucide="ban" className="w-4 h-4 mr-1"></i>
                          Revoke
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {displayMembers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {activeTab === 'pending' 
              ? 'No pending members to approve.'
              : 'No members found.'
            }
          </div>
        )}
      </div>
    </div>
  )
}







