import React from 'react'
import { Calendar, Clock, MapPin, Eye } from 'lucide-react'
import EventStatusBadge from './EventStatusBadge'

type ActivityItem = {
  _id?: string
  id?: string
  title: string
  description?: string
  date?: string
  eventDate?: string
  time?: string
  eventTime?: string
  location?: string
  image?: string
  imageUrl?: string
  status?: string
  schedule?: string
}

function itemDate(item: ActivityItem) {
  return item.date || item.eventDate || ''
}
function itemTime(item: ActivityItem) {
  return item.time || item.eventTime || ''
}
function itemImage(item: ActivityItem) {
  return item.image || item.imageUrl || ''
}

export default function ActivitiesGrid({ items, onView }: { items: ActivityItem[]; onView: (item: any) => void }) {
  const sorted = [...items].sort((a, b) => {
    const da = new Date(itemDate(a)).getTime() || 0
    const db = new Date(itemDate(b)).getTime() || 0
    return db - da
  })

  if (sorted.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No activities published yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sorted.map((ev) => {
        const img = itemImage(ev)
        const dateStr = itemDate(ev)
        const timeStr = itemTime(ev)
        return (
          <div
            key={ev._id || ev.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onView(ev)}
          >
            {img && (
              <img
                src={img}
                alt={ev.title}
                className="w-full h-48 object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            )}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-gray-800">{ev.title} <EventStatusBadge status={ev.status} /></h4>
                <Eye className="w-4 h-4 text-gray-400" />
              </div>
              {dateStr && (
                <p className="text-sm text-gray-600 mb-1 flex items-center">
                  <Calendar className="inline mr-1 w-4 h-4" />
                  {new Date(dateStr).toLocaleDateString()}
                </p>
              )}
              {(timeStr || ev.schedule) && (
                <p className="text-sm text-gray-600 mb-1 flex items-center">
                  <Clock className="inline mr-1 w-4 h-4" />
                  {timeStr || ev.schedule}
                </p>
              )}
              {ev.location && (
                <p className="text-sm text-gray-600 mb-2 flex items-center">
                  <MapPin className="inline mr-1 w-4 h-4" />
                  {ev.location}
                </p>
              )}
              {ev.description && <p className="text-gray-700 text-sm line-clamp-2">{ev.description}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
