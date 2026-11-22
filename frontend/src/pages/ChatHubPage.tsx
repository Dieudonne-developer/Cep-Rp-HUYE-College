import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApiBaseUrl } from '../utils/api'
import { WhatsAppGroupCard } from './WhatsAppGroupsPage'

const groups = [
  { key: 'cepier', name: 'CEPier (General)' },
  { key: 'choir', name: 'Ishyangaryera Choir' },
  { key: 'anointed', name: 'Anointed' },
]

type WaGroup = { id: string; slug: string; name: string; description?: string; inviteUrl?: string | null; isActive?: boolean }

export default function ChatHubPage() {
  const baseUrl = getApiBaseUrl()
  const [form, setForm] = useState({ username: '', password: '', group: 'cepier' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [waGroups, setWaGroups] = useState<WaGroup[]>([])

  useEffect(() => {
    fetch(`${baseUrl}/api/whatsapp/groups`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setWaGroups((data.groups || []).filter((g: WaGroup) => g.isActive !== false))
      })
      .catch(() => {})
  }, [baseUrl])

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!form.username.trim() || !form.password.trim() || !form.group) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username.trim(), password: form.password, userGroup: form.group })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message || 'Login failed')
      if (data.accessToken) sessionStorage.setItem('accessToken', data.accessToken)
      sessionStorage.setItem('chatUser', data.user.username)
      sessionStorage.setItem('userInfo', JSON.stringify(data.user))
      sessionStorage.setItem('userGroup', data.user.userGroup || form.group)
      sessionStorage.removeItem('adminGroup')
      window.location.href = `/${form.group}/chat`
    } catch (err: any) {
      setError(err?.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">CEPier Chat</h2>
      <p className="text-gray-700 mb-2">Use your CEPier credentials to enter the community chat room.</p>
      <p className="text-sm text-blue-700 bg-blue-50 border border-blue-200 px-4 py-2 rounded mb-6">
        Your chat access must be approved by the Super Admin on the <Link className="underline" to="/admin/super-admins?tab=homepage&global=cepier-members">CEPier Members</Link> page. If you just registered, please wait for approval before logging in.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-5 rounded-lg">
          <h3 className="text-xl font-semibold text-blue-800 mb-4">Quick Join</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {groups.map((g) => (
              <button
                key={g.key}
                onClick={() => (window.location.href = `/${g.key}/chat`)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg text-left"
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-5 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Login</h3>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Family</label>
              <select
                value={form.group}
                onChange={(e) => setForm((p) => ({ ...p, group: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {groups.map((g) => (
                  <option key={g.key} value={g.key}>{g.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                placeholder="Enter your username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="Enter your password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <button type="button" onClick={() => (window.location.href = '/cepier/forgot-password')} className="text-blue-700 hover:text-blue-900">Forgot password?</button>
              <button type="button" onClick={() => (window.location.href = '/register?family=cepier')} className="text-blue-700 hover:text-blue-900">Register</button>
            </div>
            <button type="submit" disabled={busy} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2 px-4 rounded-lg transition">
              {busy ? 'Logging in...' : 'Login & Enter Chat'}
            </button>
          </form>
        </div>
      </div>

      {waGroups.length > 0 && (
        <div className="mt-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">Join WhatsApp Groups</h3>
          <p className="text-gray-600 mb-4 text-sm">Invitation links are managed by each group's administrator.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {waGroups.map((g) => (
              <WhatsAppGroupCard
                key={g.id || g.slug}
                slug={g.slug}
                group={{ name: g.name, description: g.description, hasInvite: Boolean(g.inviteUrl), inviteUrl: g.inviteUrl || null }}
              />
            ))}
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-sm">
        <Link to="/my-attendance" className="text-blue-700 hover:text-blue-900 underline">View my practice attendance</Link>
      </p>
    </div>
  )
}
