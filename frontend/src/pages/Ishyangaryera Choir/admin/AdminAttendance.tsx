import React, { useEffect, useState } from 'react'
import { getApiBaseUrl } from '../../../utils/api'

interface Session {
  id: string
  group: string
  title: string
  session_date?: string
  location?: string
  notes?: string
}

interface Member {
  id: string
  name: string
  email: string
  contact_number?: string
  record?: {
    status: 'present' | 'absent' | 'late'
    has_reason?: boolean
    reason?: string
  } | null
}

interface RosterMember extends Member {
  mark: 'present' | 'absent' | 'late' | ''
  hasReason: boolean
  reason: string
}

export default function AdminAttendance() {
  const baseUrl = getApiBaseUrl()
  const adminGroup = (() => {
    try {
      const raw = localStorage.getItem('admin')
      if (!raw) return 'choir'
      return JSON.parse(raw)?.adminGroup || 'choir'
    } catch { return 'choir' }
  })()
  const adminEmail = (() => {
    try { return JSON.parse(localStorage.getItem('admin') || '{}')?.email || '' } catch { return '' }
  })()
  const headers: Record<string, string> = { 'X-Admin-Group': adminGroup, 'X-Admin-Email': adminEmail }
  const jsonHeaders = { ...headers, 'Content-Type': 'application/json' }

  const [sessions, setSessions] = useState<Session[]>([])
  const [selected, setSelected] = useState<Session | null>(null)
  const [roster, setRoster] = useState<RosterMember[]>([])
  const [loading, setLoading] = useState(true)
  const [rosterLoading, setRosterLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [showSessionForm, setShowSessionForm] = useState(false)
  const [sessionForm, setSessionForm] = useState({ title: '', date: '', location: '', notes: '' })
  const [showSingerForm, setShowSingerForm] = useState(false)
  const [singerForm, setSingerForm] = useState({ email: '', fullName: '', phone: '' })
  const [singerBusy, setSingerBusy] = useState(false)

  useEffect(() => { fetchSessions() }, [])

  const fetchSessions = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${baseUrl}/api/attendance/sessions?group=${adminGroup}`, { headers })
      const data = await res.json()
      if (data.sessions) setSessions(data.sessions)
    } catch { /* ignore */ }
    setLoading(false)
  }

  const openRoster = async (session: Session) => {
    setSelected(session)
    setRosterLoading(true)
    setMessage(null)
    try {
      const res = await fetch(`${baseUrl}/api/attendance/sessions/${session.id}/roster`, { headers })
      const data = await res.json()
      if (data.members) {
        setRoster(data.members.map((m: Member) => ({
          ...m,
          mark: m.record?.status || '',
          hasReason: !!m.record?.has_reason,
          reason: m.record?.reason || '',
        })))
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load roster' })
    }
    setRosterLoading(false)
  }

  const updateMark = (id: string, patch: Partial<RosterMember>) => {
    setRoster(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m))
  }

  const saveRecords = async () => {
    if (!selected) return
    setSaving(true)
    setMessage(null)
    try {
      const records = roster
        .filter(m => m.mark)
        .map(m => ({
          userId: m.id,
          status: m.mark,
          hasReason: m.mark === 'absent' ? m.hasReason : false,
          reason: m.mark === 'absent' && m.hasReason ? m.reason : '',
        }))
      const res = await fetch(`${baseUrl}/api/attendance/sessions/${selected.id}/records`, {
        method: 'PUT',
        headers: jsonHeaders,
        body: JSON.stringify({ records }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Save failed')
      setMessage({ type: 'success', text: 'Attendance saved' })
      openRoster(selected)
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to save attendance' })
    }
    setSaving(false)
  }

  const createSession = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${baseUrl}/api/attendance/sessions`, {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({ ...sessionForm, group: adminGroup }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to create session')
      setShowSessionForm(false)
      setSessionForm({ title: '', date: '', location: '', notes: '' })
      fetchSessions()
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to create session' })
    }
  }

  const deleteSession = async (id: string) => {
    if (!window.confirm('Delete this practice session and all its attendance records?')) return
    await fetch(`${baseUrl}/api/attendance/sessions/${id}`, { method: 'DELETE', headers })
    if (selected?.id === id) { setSelected(null); setRoster([]) }
    fetchSessions()
  }

  const createSinger = async (e: React.FormEvent) => {
    e.preventDefault()
    setSingerBusy(true)
    setMessage(null)
    try {
      const res = await fetch(`${baseUrl}/api/attendance/singers`, {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({ ...singerForm, group: adminGroup }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to create singer')
      setShowSingerForm(false)
      setSingerForm({ email: '', fullName: '', phone: '' })
      const linkNote = data.passwordSetupLink ? ` Password setup link (share manually if no email arrives): ${data.passwordSetupLink}` : ''
      setMessage({ type: 'success', text: `Singer account created — password setup email sent to ${singerForm.email}.${linkNote}` })
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Failed to create singer' })
    }
    setSingerBusy(false)
  }

  const marked = roster.filter(m => m.mark).length

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Practice Attendance</h1>
          <p className="text-sm text-gray-500">Mark singer attendance for every practice session.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSingerForm(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Add Singer
          </button>
          <button onClick={() => setShowSessionForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + New Session
          </button>
        </div>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sessions list */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-800 mb-3">Sessions</h2>
          {loading ? <p className="text-sm text-gray-400">Loading...</p> : sessions.length === 0 ? (
            <p className="text-sm text-gray-400">No sessions yet. Create one to start marking attendance.</p>
          ) : (
            <ul className="space-y-2">
              {sessions.map(s => (
                <li key={s.id} className={`flex items-center justify-between rounded-lg border px-3 py-2 cursor-pointer ${selected?.id === s.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  onClick={() => openRoster(s)}>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{s.title}</p>
                    <p className="text-xs text-gray-500">{s.session_date ? new Date(s.session_date).toLocaleDateString() : 'No date'}{s.location ? ` • ${s.location}` : ''}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteSession(s.id) }} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Roster */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          {!selected ? (
            <p className="text-sm text-gray-400">Select a session to mark attendance.</p>
          ) : rosterLoading ? (
            <p className="text-sm text-gray-400">Loading roster...</p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-semibold text-gray-800">{selected.title}</h2>
                  <p className="text-xs text-gray-500">{marked} of {roster.length} marked</p>
                </div>
                <button onClick={saveRecords} disabled={saving} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  {saving ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
              {roster.length === 0 ? (
                <p className="text-sm text-gray-400">No members found for this group. Add singers first.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-500 border-b">
                        <th className="py-2 pr-3">Singer</th>
                        <th className="py-2 pr-3">Status</th>
                        <th className="py-2">Reason (if absent)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roster.map(m => (
                        <tr key={m.id} className="border-b border-gray-100 align-top">
                          <td className="py-2 pr-3">
                            <p className="font-medium text-gray-800">{m.name}</p>
                            <p className="text-xs text-gray-400">{m.email}</p>
                          </td>
                          <td className="py-2 pr-3">
                            <select
                              value={m.mark}
                              onChange={(e) => updateMark(m.id, { mark: e.target.value as RosterMember['mark'], hasReason: false, reason: '' })}
                              className="border border-gray-300 rounded px-2 py-1 text-sm"
                            >
                              <option value="">—</option>
                              <option value="present">Present</option>
                              <option value="absent">Absent</option>
                              <option value="late">Late</option>
                            </select>
                          </td>
                          <td className="py-2">
                            {m.mark === 'absent' ? (
                              <div className="space-y-1">
                                <label className="flex items-center gap-2 text-xs text-gray-600">
                                  <input type="checkbox" checked={m.hasReason} onChange={(e) => updateMark(m.id, { hasReason: e.target.checked })} />
                                  Valid reason
                                </label>
                                {m.hasReason && (
                                  <input
                                    type="text"
                                    value={m.reason}
                                    onChange={(e) => updateMark(m.id, { reason: e.target.value })}
                                    placeholder="Reason for absence"
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                  />
                                )}
                              </div>
                            ) : <span className="text-xs text-gray-300">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* New session modal */}
      {showSessionForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <form onSubmit={createSession} className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-gray-900">New Practice Session</h3>
            <input required value={sessionForm.title} onChange={e => setSessionForm({ ...sessionForm, title: e.target.value })} placeholder="Title (e.g. Saturday Rehearsal)" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            <input type="date" value={sessionForm.date} onChange={e => setSessionForm({ ...sessionForm, date: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            <input value={sessionForm.location} onChange={e => setSessionForm({ ...sessionForm, location: e.target.value })} placeholder="Location (optional)" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            <textarea value={sessionForm.notes} onChange={e => setSessionForm({ ...sessionForm, notes: e.target.value })} placeholder="Notes (optional)" rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowSessionForm(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Create</button>
            </div>
          </form>
        </div>
      )}

      {/* Add singer modal */}
      {showSingerForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <form onSubmit={createSinger} className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Add Singer</h3>
            <p className="text-xs text-gray-500">The singer will receive an email with a link to set their password and view their attendance.</p>
            <input required type="email" value={singerForm.email} onChange={e => setSingerForm({ ...singerForm, email: e.target.value })} placeholder="Gmail address" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            <input required value={singerForm.fullName} onChange={e => setSingerForm({ ...singerForm, fullName: e.target.value })} placeholder="Full name" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            <input value={singerForm.phone} onChange={e => setSingerForm({ ...singerForm, phone: e.target.value })} placeholder="Phone number" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowSingerForm(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button type="submit" disabled={singerBusy} className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium">
                {singerBusy ? 'Creating...' : 'Create & Send Email'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
