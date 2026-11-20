import React, { useEffect, useState } from 'react'
import { getApiBaseUrl } from '../../../utils/api'

type Group = {
  id: string
  slug: string
  name: string
  description: string
  inviteUrl: string
  isActive: boolean
  hasInvite: boolean
  canManage: boolean
}

type AccessRequest = {
  id: string
  groupName: string
  username: string
  userEmail: string
  userGroup: string
  status: string
  note: string
}

const emptyForm = { name: '', description: '', inviteUrl: '', isActive: true }

export default function AdminWhatsApp() {
  const baseUrl = getApiBaseUrl()
  const [groups, setGroups] = useState<Group[]>([])
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState<Group | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  function headers(json = false) {
    const admin = JSON.parse(localStorage.getItem('admin') || '{}')
    return {
      ...(json ? { 'Content-Type': 'application/json' } : {}),
      'X-Admin-Email': admin.email || '',
      'X-Admin-Group': admin.adminGroup || '',
    }
  }

  async function load() {
    const [groupRes, requestRes] = await Promise.all([
      fetch(`${baseUrl}/api/whatsapp/admin/groups`, { headers: headers() }),
      fetch(`${baseUrl}/api/whatsapp/admin/requests`, { headers: headers() }),
    ])
    const groupData = await groupRes.json()
    const requestData = await requestRes.json()
    if (!groupData.success) throw new Error(groupData.message || 'Could not load groups')
    if (!requestData.success) throw new Error(requestData.message || 'Could not load requests')
    setGroups(groupData.groups || [])
    setIsSuperAdmin(Boolean(groupData.isSuperAdmin))
    setRequests(requestData.requests || [])
  }

  useEffect(() => {
    load().catch((err) => setError(err.message)).finally(() => setLoading(false))
  }, [])

  async function saveGroup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setNotice('')
    const payload = {
      name: editing ? editing.name : form.name,
      description: editing ? editing.description : form.description,
      inviteUrl: editing ? editing.inviteUrl : form.inviteUrl,
      isActive: editing ? editing.isActive : form.isActive,
    }
    const res = await fetch(editing ? `${baseUrl}/api/whatsapp/admin/groups/${editing.id}` : `${baseUrl}/api/whatsapp/admin/groups`, {
      method: editing ? 'PUT' : 'POST',
      headers: headers(true),
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!data.success) {
      setError(data.message || 'Could not save group')
      return
    }
    setNotice(editing ? 'Group updated.' : 'Group added.')
    setEditing(null)
    setForm(emptyForm)
    await load()
  }

  async function toggleActive(group: Group) {
    setError('')
    const res = await fetch(`${baseUrl}/api/whatsapp/admin/groups/${group.id}`, {
      method: 'PUT',
      headers: headers(true),
      body: JSON.stringify({ isActive: !group.isActive }),
    })
    const data = await res.json()
    if (!data.success) {
      setError(data.message || 'Could not update group')
      return
    }
    await load()
  }

  async function decide(id: string, status: 'approved' | 'rejected') {
    const note = status === 'rejected' ? window.prompt('Optional note for the member', '') || '' : ''
    const res = await fetch(`${baseUrl}/api/whatsapp/admin/requests/${id}/decision`, {
      method: 'POST',
      headers: headers(true),
      body: JSON.stringify({ status, note }),
    })
    const data = await res.json()
    if (!data.success) {
      setError(data.message || 'Could not update request')
      return
    }
    setNotice(data.message)
    await load()
  }

  if (loading) return <div className="p-6">Loading WhatsApp groups...</div>

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">WhatsApp Group Management</h2>
        <p className="text-gray-600 mt-1">Edit names, descriptions, and invitation links. Approving a member only reveals the link. It does not add them to WhatsApp.</p>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}
      {notice && <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">{notice}</div>}

      {isSuperAdmin && (
      <form onSubmit={saveGroup} className="bg-white border border-gray-200 rounded-lg p-4 grid md:grid-cols-2 gap-3">
        <h3 className="md:col-span-2 font-semibold text-gray-800">{editing ? `Edit ${editing.slug}` : 'Add a group'}</h3>
        <input value={editing ? editing.name : form.name} onChange={(e) => editing ? setEditing({ ...editing, name: e.target.value }) : setForm({ ...form, name: e.target.value })} placeholder="Group name" className="px-3 py-2 border border-gray-300 rounded-lg" required />
        <input value={editing ? editing.inviteUrl : form.inviteUrl} onChange={(e) => editing ? setEditing({ ...editing, inviteUrl: e.target.value }) : setForm({ ...form, inviteUrl: e.target.value })} placeholder="https://chat.whatsapp.com/..." className="px-3 py-2 border border-gray-300 rounded-lg" />
        <textarea value={editing ? editing.description : form.description} onChange={(e) => editing ? setEditing({ ...editing, description: e.target.value }) : setForm({ ...form, description: e.target.value })} placeholder="Description" className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg" rows={2} />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={editing ? editing.isActive : form.isActive} onChange={(e) => editing ? setEditing({ ...editing, isActive: e.target.checked }) : setForm({ ...form, isActive: e.target.checked })} />
          Active
        </label>
        <div className="flex gap-2 justify-end">
          {editing && <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg border border-gray-300">Cancel</button>}
          <button className="px-4 py-2 rounded-lg bg-blue-700 text-white">{editing ? 'Save changes' : 'Add group'}</button>
        </div>
      </form>
      )}
      {!isSuperAdmin && editing && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Edit {editing.name}</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Group name" className="px-3 py-2 border border-gray-300 rounded-lg" />
            <input value={editing.inviteUrl} onChange={(e) => setEditing({ ...editing, inviteUrl: e.target.value })} placeholder="https://chat.whatsapp.com/..." className="px-3 py-2 border border-gray-300 rounded-lg" />
            <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Description" className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg" rows={2} />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} />
              Active
            </label>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg border border-gray-300">Cancel</button>
              <button onClick={saveGroup} className="px-4 py-2 rounded-lg bg-blue-700 text-white">Save changes</button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2">Group</th>
              <th className="px-3 py-2">Invitation</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group.id} className="border-t">
                <td className="px-3 py-3">
                  <div className="font-medium">{group.name}</div>
                  <div className="text-gray-500">{group.description}</div>
                </td>
                <td className="px-3 py-3 max-w-xs break-all">{group.hasInvite ? group.inviteUrl : 'Invitation link not yet provided.'}</td>
                <td className="px-3 py-3">{group.isActive ? 'Active' : 'Inactive'}</td>
                <td className="px-3 py-3 whitespace-nowrap">
                  {group.canManage ? (
                    <>
                      <button onClick={() => setEditing(group)} className="text-blue-700 mr-3">Edit</button>
                      <button onClick={() => toggleActive(group)} className="text-gray-700">{group.isActive ? 'Deactivate' : 'Activate'}</button>
                    </>
                  ) : (
                    <span className="text-gray-400 text-xs">Managed by Super Admin</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Access requests</h3>
        {requests.length === 0 ? <p className="text-gray-500 text-sm">No requests yet.</p> : (
          <div className="space-y-3">
            {requests.map((item) => (
              <div key={item.id} className="border border-gray-100 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="font-medium">{item.username || item.userEmail} <span className="text-gray-500 font-normal">→ {item.groupName}</span></div>
                  <div className="text-sm text-gray-500">{item.userEmail} · {item.userGroup} · {item.status}{item.note ? ` · ${item.note}` : ''}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => decide(item.id, 'approved')} className="bg-green-600 text-white px-3 py-1 rounded">Approve</button>
                  <button onClick={() => decide(item.id, 'rejected')} className="bg-red-600 text-white px-3 py-1 rounded">Reject</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
