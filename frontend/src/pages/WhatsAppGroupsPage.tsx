import React, { useEffect, useState } from 'react'
import { getApiBaseUrl } from '../utils/api'

type WhatsAppGroup = {
  id: string
  slug: string
  name: string
  description: string
  hasInvite: boolean
  inviteUrl: string | null
}

type OpenResult = {
  inviteUrl: string | null
  message: string
}

export function WhatsAppAccessForm({ slug, label, inviteUrl }: { slug: string; label?: string; inviteUrl?: string | null }) {
  const baseUrl = getApiBaseUrl()
  const [contactNumber, setContactNumber] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<OpenResult | null>(null)
  const [resolvedInvite, setResolvedInvite] = useState<string | null>(inviteUrl ?? null)
  const [inviteChecked, setInviteChecked] = useState(inviteUrl !== undefined)

  useEffect(() => {
    if (inviteUrl !== undefined) {
      setResolvedInvite(inviteUrl || null)
      setInviteChecked(true)
      return
    }
    let cancelled = false
    fetch(`${baseUrl}/api/whatsapp/groups`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        const group = ((data.groups || []) as WhatsAppGroup[]).find((g) => g.slug === slug)
        setResolvedInvite(group?.inviteUrl || null)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setInviteChecked(true)
      })
    return () => {
      cancelled = true
    }
  }, [slug, baseUrl, inviteUrl])

  if (!inviteChecked) return null
  if (resolvedInvite) {
    return (
      <a
        href={resolvedInvite}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
      >
        Join WhatsApp Group
      </a>
    )
  }

  async function openGroup(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch(`${baseUrl}/api/whatsapp/open`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, contactNumber: contactNumber.trim() }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message || 'This contact number cannot open the group')
      setResult({ inviteUrl: data.inviteUrl || null, message: data.message })
    } catch (err: any) {
      setError(err.message || 'Could not open the group')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={openGroup} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contact number</label>
        <input
          type="tel"
          inputMode="tel"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          placeholder="07..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          required
        />
      </div>
      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded px-3 py-2">{error}</p>}
      {result && (
        <div className="text-sm text-green-800 bg-green-50 border border-green-100 rounded px-3 py-2 space-y-2">
          <p>{result.message}</p>
          {result.inviteUrl && (
            <a href={result.inviteUrl} target="_blank" rel="noopener noreferrer" className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg">
              Join WhatsApp Group
            </a>
          )}
        </div>
      )}
      <button disabled={busy} className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2 px-4 rounded-lg">
        {busy ? 'Checking...' : label || 'Open WhatsApp group'}
      </button>
    </form>
  )
}

export default function WhatsAppGroupsPage() {
  const baseUrl = getApiBaseUrl()
  const [groups, setGroups] = useState<WhatsAppGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${baseUrl}/api/whatsapp/groups`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) throw new Error(data.message || 'Could not load groups')
        setGroups(data.groups || [])
      })
      .catch((err) => setError(err.message || 'Could not load groups'))
      .finally(() => setLoading(false))
  }, [baseUrl])

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">WhatsApp Groups</h2>
      <p className="text-gray-600 mt-1">Join a WhatsApp group by clicking its button. Groups still waiting for their invitation link will say so.</p>
      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 px-4 py-2 rounded my-4">
        Opening a link does not add you to the group by itself — confirm the join inside WhatsApp.
      </p>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}
      {loading ? <p className="text-gray-600">Loading groups...</p> : (
        <div className="grid md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <div key={group.id} className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800">{group.name}</h3>
              <p className="text-sm text-gray-600 mt-1 mb-3">{group.description}</p>
              {!group.hasInvite && <p className="text-sm text-gray-500 mb-3">Invitation link not yet provided.</p>}
              <WhatsAppAccessForm slug={group.slug} inviteUrl={group.inviteUrl} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
