import React, { useEffect, useState } from 'react'
import { getApiBaseUrl } from '../utils/api'

interface AttendanceRecord {
  id: string
  status: 'present' | 'absent' | 'late'
  has_reason?: boolean
  reason?: string
  session_title: string
  session_date?: string
  session_time?: string
  session_location?: string
  session_group?: string
}

const STATUS_STYLE: Record<string, string> = {
  present: 'bg-green-100 text-green-700',
  absent: 'bg-red-100 text-red-700',
  late: 'bg-yellow-100 text-yellow-700',
}

const LOGIN_GROUPS = [
  { key: 'choir', name: 'Ishyangaryera Choir' },
  { key: 'anointed', name: 'Anointed' },
]

export default function MyAttendancePage() {
  const baseUrl = getApiBaseUrl()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [needsLogin, setNeedsLogin] = useState(false)
  const [loginForm, setLoginForm] = useState({ username: '', password: '', group: 'choir' })
  const [loginBusy, setLoginBusy] = useState(false)
  const [loginError, setLoginError] = useState('')

  const accessToken = sessionStorage.getItem('accessToken') || ''
  const userInfo = (() => {
    try { return JSON.parse(sessionStorage.getItem('userInfo') || 'null') } catch { return null }
  })()

  useEffect(() => {
    if (!accessToken) { setLoading(false); setNeedsLogin(true); return }
    fetch(`${baseUrl}/api/attendance/me`, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(r => r.json())
      .then(data => {
        if (data.records) setRecords(data.records)
        else { setError(data.message || 'Failed to load attendance'); setNeedsLogin(true) }
      })
      .catch(() => { setError('Failed to load attendance'); setNeedsLogin(true) })
      .finally(() => setLoading(false))
  }, [baseUrl, accessToken])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginBusy(true)
    setLoginError('')
    try {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginForm.username.trim(), password: loginForm.password, userGroup: loginForm.group }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message || 'Login failed')
      if (data.accessToken) sessionStorage.setItem('accessToken', data.accessToken)
      sessionStorage.setItem('userInfo', JSON.stringify(data.user))
      sessionStorage.setItem('userGroup', data.user.userGroup || loginForm.group)
      window.location.reload()
    } catch (err: any) {
      setLoginError(err?.message || 'Login failed')
      setLoginBusy(false)
    }
  }

  if (needsLogin) {
    return (
      <div className="max-w-md mx-auto p-6 mt-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">My Attendance</h1>
          <p className="text-sm text-gray-500 mb-5">Log in with the account your choir admin created for you.</p>
          {loginError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{loginError}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Choir</label>
              <select
                value={loginForm.group}
                onChange={(e) => setLoginForm((p) => ({ ...p, group: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                {LOGIN_GROUPS.map((g) => <option key={g.key} value={g.key}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username or Email</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm((p) => ({ ...p, username: e.target.value }))}
                placeholder="Enter your username or email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="Enter your password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <button type="submit" disabled={loginBusy} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2 px-4 rounded-lg">
              {loginBusy ? 'Logging in...' : 'Login'}
            </button>
          </form>
          {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
        </div>
      </div>
    )
  }

  const escCsv = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`

  const downloadCsv = () => {
    const header = ['Session', 'Date', 'Time', 'Group', 'Status', 'Reason']
    const rows = records.map(r => [
      r.session_title,
      r.session_date ? new Date(r.session_date).toLocaleDateString() : '',
      r.session_time || '',
      r.session_group || '',
      r.status,
      r.status === 'absent' && r.has_reason ? (r.reason || 'Valid reason recorded') : '',
    ])
    const csv = '﻿' + [header, ...rows].map(r => r.map(escCsv).join(',')).join('\r\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'my-attendance.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
        {records.length > 0 && (
          <button onClick={downloadCsv} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Download CSV
          </button>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-6">
        {userInfo?.username || userInfo?.email || 'Your'} practice attendance records.
      </p>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : records.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-500">
          No attendance records yet. Your choir admin will mark you after practice sessions.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500">
              <tr>
                <th className="px-4 py-3">Session</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Reason</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-800">{r.session_title}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.session_date ? new Date(r.session_date).toLocaleDateString() : '—'}
                    {r.session_time ? <span className="block text-xs text-gray-400">{r.session_time}</span> : null}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLE[r.status] || 'bg-gray-100 text-gray-600'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {r.status === 'absent' && r.has_reason ? (r.reason || 'Valid reason recorded') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
