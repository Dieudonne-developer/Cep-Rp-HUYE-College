import React, { useEffect, useState } from 'react'
import { getApiBaseUrl } from '../utils/api'

type SupportEntry = {
  id: string
  group?: string
  title: string
  description: string
  kind: string
  details: string
  url: string
}

const KIND_LABELS: Record<string, string> = {
  bank: 'Bank Transfer',
  mobile: 'Mobile Money',
  link: 'Link',
  help: 'Help / Info',
  other: 'Support',
}

const GROUP_LABELS: Record<string, string> = {
  global: 'CEP General',
  cepier: 'CEP',
  choir: 'Ishyanga Ryera Choir',
  anointed: 'Anointed',
  abanyamugisha: 'Abanyamugisha',
}

function groupLabel(g?: string) {
  if (!g) return 'CEP General'
  return GROUP_LABELS[g] || g.charAt(0).toUpperCase() + g.slice(1)
}

function ItemCard({ item }: { item: SupportEntry }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center gap-2 mb-1">
        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          {KIND_LABELS[item.kind] || 'Support'}
        </span>
        <h5 className="font-semibold text-gray-800">{item.title}</h5>
      </div>
      {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
      {item.details && <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{item.details}</p>}
      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-sm font-medium text-blue-600 hover:underline break-all"
        >
          Open link →
        </a>
      )}
    </div>
  )
}

export default function SupportItems({ group }: { group: string }) {
  const baseUrl = getApiBaseUrl()
  const [items, setItems] = useState<SupportEntry[]>([])

  useEffect(() => {
    const url = group === 'all'
      ? `${baseUrl}/api/home/support-items`
      : `${baseUrl}/api/home/support-items?group=${encodeURIComponent(group)}`
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setItems(data.items || [])
      })
      .catch(() => {})
  }, [baseUrl, group])

  if (items.length === 0) return null

  if (group !== 'all') {
    return (
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Ways to Support</h4>
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((item) => <ItemCard key={item.id} item={item} />)}
        </div>
      </div>
    )
  }

  const byGroup = items.reduce<Record<string, SupportEntry[]>>((acc, item) => {
    const g = item.group || 'global'
    ;(acc[g] = acc[g] || []).push(item)
    return acc
  }, {})

  return (
    <div className="mb-6">
      <h4 className="text-lg font-semibold text-gray-800 mb-3">Support Options from All Families</h4>
      <div className="space-y-6">
        {Object.entries(byGroup).map(([g, groupItems]) => (
          <div key={g}>
            <h5 className="text-md font-semibold text-gray-700 mb-2">{groupLabel(g)}</h5>
            <div className="grid md:grid-cols-2 gap-4">
              {groupItems.map((item) => <ItemCard key={item.id} item={item} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
