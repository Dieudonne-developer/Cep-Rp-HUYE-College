import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApiBaseUrl } from '../utils/api'
import { WhatsAppGroupCard } from './WhatsAppGroupsPage'

const groups = [
  { key: 'cepier', name: 'CEP (General)' },
  { key: 'choir', name: 'Ishyangaryera Choir' },
  { key: 'anointed', name: 'Anointed' },
]

type WaGroup = { id: string; slug: string; name: string; description?: string; inviteUrl?: string | null; isActive?: boolean }

export default function ChatHubPage() {
  const baseUrl = getApiBaseUrl()
  const [waGroups, setWaGroups] = useState<WaGroup[]>([])

  useEffect(() => {
    fetch(`${baseUrl}/api/whatsapp/groups`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setWaGroups((data.groups || []).filter((g: WaGroup) => g.isActive !== false))
      })
      .catch(() => {})
  }, [baseUrl])

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Join CEP WhatsApp Groups</h2>
      <p className="text-gray-700 mb-6">Connect with your CEP family on WhatsApp. Invitation links are managed by each group's administrator.</p>

      {waGroups.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {waGroups.map((g) => (
            <WhatsAppGroupCard
              key={g.id || g.slug}
              slug={g.slug}
              group={{ name: g.name, description: g.description, hasInvite: Boolean(g.inviteUrl), inviteUrl: g.inviteUrl || null }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Loading WhatsApp groups...</p>
        </div>
      )}

      <p className="mt-6 text-center text-sm">
        <Link to="/my-attendance" className="text-blue-700 hover:text-blue-900 underline">View my practice attendance</Link>
      </p>
    </div>
  )
}
