import React, { useEffect, useState } from 'react'
import { getApiBaseUrl } from '../../../utils/api'
import { useNavigate } from 'react-router-dom'
import { useLucideIcons } from '../../../utils/lucideIcons'

type Member = {
  _id: string
  email: string
  contactNumber?: string
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
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [editForm, setEditForm] = useState({ username: '', email: '', contactNumber: '' })
  const baseUrl = getApiBaseUrl()
  const adminGroup = (() => {
    try {
      const raw = localStorage.getItem('admin')
      if (!raw) return 'choir'
      const obj = JSON.parse(raw)
      return obj?.adminGroup || 'choir'
    } catch { return 'choir' }
  })()
  const groupQuery = adminGroup === 'cepier' ? 'group=cepier' : adminGroup === 'anointed' ? 'group=anointed' : adminGroup === 'abanyamugisha' ? 'group=abanyamugisha' : adminGroup === 'psalm23' ? 'group=psalm23' : adminGroup === 'psalm46' ? 'group=psalm46' : adminGroup === 'protocol' ? 'group=protocol' : adminGroup === 'social' ? 'group=social' : adminGroup === 'evangelical' ? 'group=evangelical' : 'group=choir'
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ username: '', email: '', contactNumber: '' })
  const [addBusy, setAddBusy] = useState(false)
  const [addMessage, setAddMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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

  const handleEdit = (member: Member) => {
    setEditingMember(member)
    setEditForm({ username: member.username || '', email: member.email || '', contactNumber: member.contactNumber || '' })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingMember) return
    try {
      const adminRaw = localStorage.getItem('admin')
      const admin = adminRaw ? JSON.parse(adminRaw) : {}
      const response = await fetch(`${baseUrl}/api/admin/members/${editingMember._id}?${groupQuery}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Group': adminGroup, 'X-Admin-Email': admin?.email || '' },
        body: JSON.stringify(editForm)
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        alert(data.message || 'Failed to update member')
        return
      }
      setEditingMember(null)
      fetchMembers()
      fetchPendingMembers()
    } catch (error) {
      console.error('Failed to update member:', error)
      alert('Failed to update member')
    }
  }

  const handleDelete = async (member: Member) => {
    if (!confirm(`Delete ${member.username || member.email}? This cannot be undone.`)) return
    try {
      const adminRaw = localStorage.getItem('admin')
      const admin = adminRaw ? JSON.parse(adminRaw) : {}
      const response = await fetch(`${baseUrl}/api/admin/members/${member._id}?${groupQuery}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Group': adminGroup, 'X-Admin-Email': admin?.email || '' }
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        alert(data.message || 'Failed to delete member')
        return
      }
      fetchMembers()
      fetchPendingMembers()
    } catch (error) {
      console.error('Failed to delete member:', error)
      alert('Failed to delete member')
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddBusy(true)
    setAddMessage(null)
    try {
      const adminRaw = localStorage.getItem('admin')
      const admin = adminRaw ? JSON.parse(adminRaw) : {}
      const response = await fetch(`${baseUrl}/api/admin/members?${groupQuery}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Group': adminGroup, 'X-Admin-Email': admin?.email || '' },
        body: JSON.stringify(addForm)
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.success) {
        setAddMessage({ type: 'error', text: data.message || 'Failed to register member' })
        return
      }
      setAddMessage({ type: 'success', text: 'Member registered successfully!' })
      setAddForm({ username: '', email: '', contactNumber: '' })
      setTimeout(() => {
        setShowAddModal(false)
        setAddMessage(null)
        fetchMembers()
        fetchPendingMembers()
      }, 1200)
    } catch (error) {
      console.error('Failed to register member:', error)
      setAddMessage({ type: 'error', text: 'Failed to register member' })
    } finally {
      setAddBusy(false)
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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Manage Members</h1>
          <button
            onClick={() => { setAddForm({ username: '', email: '', contactNumber: '' }); setAddMessage(null); setShowAddModal(true) }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <i data-lucide="user-plus" className="w-4 h-4 mr-2"></i> Register Member
          </button>
        </div>
        
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
                    <div className="text-xs text-gray-500">{member.contactNumber || 'No contact number'}</div>
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
                      <button
                        onClick={() => handleEdit(member)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        title="Update member"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDelete(member)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                        title="Delete member"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editingMember && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleUpdate} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md space-y-4">
              <h2 className="text-xl font-bold text-gray-800">Update member</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact number</label>
                <input
                  type="tel"
                  value={editForm.contactNumber}
                  onChange={(e) => setEditForm({ ...editForm, contactNumber: e.target.value })}
                  placeholder="07..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setEditingMember(null)} className="px-4 py-2 rounded-lg border">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white">Save</button>
              </div>
            </form>
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleAddMember} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md space-y-4">
              <h2 className="text-xl font-bold text-gray-800">Register member</h2>
              <p className="text-sm text-gray-500">The member is approved automatically. Use their contact number so they can join WhatsApp groups.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full name / Username *</label>
                <input
                  value={addForm.username}
                  onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                  placeholder="e.g. Alice Uwase"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="member@gmail.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact / WhatsApp number</label>
                <input
                  type="tel"
                  inputMode="tel"
                  value={addForm.contactNumber}
                  onChange={(e) => setAddForm({ ...addForm, contactNumber: e.target.value })}
                  placeholder="07..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <p className="text-xs text-gray-500 mt-1">At least 9 digits. Used to verify WhatsApp group access.</p>
              </div>
              {addMessage && (
                <div className={`text-sm px-3 py-2 rounded border ${addMessage.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  {addMessage.text}
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
                <button type="submit" disabled={addBusy} className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50">
                  {addBusy ? 'Registering...' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        )}

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







