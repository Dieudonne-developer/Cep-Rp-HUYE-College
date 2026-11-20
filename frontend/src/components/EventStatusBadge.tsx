import React from 'react'

const STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  upcoming: { label: 'Upcoming', cls: 'bg-blue-100 text-blue-800' },
  ongoing: { label: 'Ongoing', cls: 'bg-green-100 text-green-800' },
  regular: { label: 'Regular', cls: 'bg-purple-100 text-purple-800' },
  completed: { label: 'Completed', cls: 'bg-gray-200 text-gray-700' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-700' },
  answered: { label: 'Answered', cls: 'bg-green-100 text-green-800' },
  testimony: { label: 'Testimony', cls: 'bg-yellow-100 text-yellow-800' },
}

export default function EventStatusBadge({ status }: { status?: string }) {
  if (!status) return null
  const s = STATUS_STYLES[status.toLowerCase()]
  if (!s) return null
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full align-middle ${s.cls}`}>
      {s.label}
    </span>
  )
}
