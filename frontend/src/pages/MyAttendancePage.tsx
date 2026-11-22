import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApiBaseUrl } from '../utils/api'

interface AttendanceRecord {
  id: string
  status: 'present' | 'absent' | 'late'
  has_reason?: boolean
  reason?: string
  session_title: string
  session_date?: string
  session_location?: string
  session_group?: string
}

const STATUS_STYLE: Record<string, string> = {
  present: 'bg-green-100 text-green-700',
  absent: 'bg-red-100 text-red-700',
  late: 'bg-yellow-100 text-yellow-700',
}

export default function MyAttendancePage() {
  const baseUrl = getApiBaseUrl()
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const userInfo = (() => {
    try { return JSON.parse(sessionStorage.getItem('userInfo') || 'null') } catch { return null }
  })()
  const accessToken = sessionStorage.getItem('accessToken') || ''

  useEffect(() => {
    if (!accessToken) { setLoading(false); setError('Please log in again to view your attendance.'); return }
    fetch(`${baseUrl}/api/attendance/me`, { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(r => r.json())
      .then(data => {
        if (data.records) setRecords(data.records)
        else setError(data.message || 'Failed to load attendance')
      })
      .catch(() => setError('Failed to load attendance'))
      .finally(() => setLoading(false))
  }, [baseUrl, accessToken])

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">My Attendance</h1>
      <p className="text-sm text-gray-500 mb-6">
        {userInfo?.username || userInfo?.email || 'Your'} practice attendance records.
      </p>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}{' '}
          <Link to="/chat" className="underline font-medium">Go to login</Link>
        </div>
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
                  <td className="px-4 py-3 text-gray-600">{r.session_date ? new Date(r.session_date).toLocaleDateString() : '—'}</td>
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
