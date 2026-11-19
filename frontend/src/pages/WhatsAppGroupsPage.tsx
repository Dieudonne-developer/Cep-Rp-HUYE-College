import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApiBaseUrl } from '../utils/api'

type WhatsAppGroup = {
  id: string
  name: string
  description: string
  hasInvite: boolean
  requestStatus: 'pending' | 'approved' | 'rejected' | null
  rejectionNote: string
  inviteUrl: string | null
}

const families = [
  { key: 'choir', name: 'Ishyanga Ryera Choir' },
  { key: 'cepier', name: 'CEPier' },
  { key: 'anointed', name: 'Anointed' },
  { key: 'abanyamugisha', name: 'Abanyamugisha' },
  { key: 'psalm23', name: 'Psalm 23' },
  { key: 'psalm46', name: 'Psalm 46' },
  { key: 'protocol', name: 'Protocol' },
  { key: 'social', name: 'Social' },
  { key: 'evangelical', name: 'Evangelical' },
]

export default function WhatsAppGroupsPage() {
  const baseUrl = getApiBaseUrl()
  const [groups, setGroups] = useState<WhatsAppGroup[]>([])
  const [signedIn, setSignedIn] = useState(false)
  const [userLabel, setUserLabel] = useState('')
  const [form, setForm] = useState({ username: '', password: '', group: 'choir' })
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  function authHeaders() {
    const token = sessionStorage.getItem('accessToken') || ''
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  async function loadGroups() {
    const res = await fetch(`${baseUrl}/api/whatsapp/groups`, { headers: authHeaders() })
    const data = await res.json()
    if (!data.success) throw new Error(data.message || 'Could not load groups')
    setGroups(data.groups || [])
    setSignedIn(Boolean(data.signedIn))
  }

  useEffect(() => {
    const raw = sessionStorage.getItem('userInfo')
    if (raw) {
      try {
        const user = JSON.parse(raw)
        setUserLabel(user.username || user.email || '')
      } catch { /* ignore */ }
    }
    loadGroups()
      .catch((err) => setError(err.message || 'Could not load groups'))
      .finally(() => setLoading(false))
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setBusyId('login')
    setError('')
    setNotice('')
    try {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
          userGroup: form.group,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message || 'Login failed')
      sessionStorage.setItem('chatUser', data.user.username)
      sessionStorage.setItem('userInfo', JSON.stringify(data.user))
      sessionStorage.setItem('userGroup', data.user.userGroup || form.group)
      if (data.accessToken) sessionStorage.setItem('accessToken', data.accessToken)
      setUserLabel(data.user.username)
      setSignedIn(true)
      await loadGroups()
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setBusyId('')
    }
  }

  function logout() {
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('userInfo')
    sessionStorage.removeItem('chatUser')
    setSignedIn(false)
    setUserLabel('')
    loadGroups().catch(() => setGroups([]))
  }

  async function requestAccess(groupId: string) {
    setBusyId(groupId)
    setError('')
    setNotice('')
    try {
      const res = await fetch(`${baseUrl}/api/whatsapp/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ groupId }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message || 'Request failed')
      setNotice(data.message)
      await loadGroups()
    } catch (err: any) {
      setError(err.message || 'Request failed')
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">WhatsApp Groups</h2>
          <p className="text-gray-600 mt-1">Request access to a group. An administrator must approve you before the invitation link is shown.</p>
        </div>
        {signedIn && (
          <button onClick={logout} className="text-sm text-blue-700 underline self-start">Sign out ({userLabel})</button>
        )}
      </div>
      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 px-4 py-2 rounded mb-4">
        Approval lets you open the WhatsApp invitation. It does not add you to the group by itself. After you open the link, join the group in WhatsApp.
      </p>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
      {notice && <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">{notice}</div>}

      {!signedIn && (
        <form onSubmit={handleLogin} className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Family</label>
            <select value={form.group} onChange={(e) => setForm((p) => ({ ...p, group: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              {families.map((family) => <option key={family.key} value={family.key}>{family.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username or email</label>
            <input value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
          </div>
          <div className="flex items-end">
            <button disabled={busyId === 'login'} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-4 rounded-lg">
              {busyId === 'login' ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          <p className="sm:col-span-2 text-sm text-gray-600">Need an account? <Link className="text-blue-700 underline" to="/choir/register">Register</Link></p>
        </form>
      )}

      {loading ? <p className="text-gray-600">Loading groups...</p> : (
        <div className="grid md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <div key={group.id} className="border border-gray-200 rounded-lg p-4 flex flex-col">
              <h3 className="text-lg font-semibold text-gray-800">{group.name}</h3>
              <p className="text-sm text-gray-600 mt-1 flex-1">{group.description}</p>
              {!group.hasInvite && (
                <p className="text-sm text-gray-500 mt-3">Invitation link not yet provided.</p>
              )}
              {group.requestStatus === 'pending' && (
                <p className="text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded px-3 py-2 mt-3">Your request is awaiting administrator approval.</p>
              )}
              {group.requestStatus === 'rejected' && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded px-3 py-2 mt-3">
                  Your request was rejected.{group.rejectionNote ? ` ${group.rejectionNote}` : ''} You can send a new request.
                </p>
              )}
              <div className="mt-4">
                {group.requestStatus === 'approved' && group.inviteUrl ? (
                  <a href={group.inviteUrl} target="_blank" rel="noopener noreferrer" className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg">
                    Join WhatsApp Group
                  </a>
                ) : group.requestStatus === 'approved' ? (
                  <p className="text-sm text-gray-500">Approved, but the invitation link is not yet provided.</p>
                ) : (
                  <button
                    onClick={() => requestAccess(group.id)}
                    disabled={!signedIn || busyId === group.id || group.requestStatus === 'pending'}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg"
                  >
                    {group.requestStatus === 'pending' ? 'Awaiting approval' : group.requestStatus === 'rejected' ? 'Request again' : 'Request access'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
