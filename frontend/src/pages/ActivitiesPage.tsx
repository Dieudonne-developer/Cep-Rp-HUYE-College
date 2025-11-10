import React, { useEffect, useMemo, useState } from 'react'
import { Calendar, Clock, MapPin, Info, Eye, X } from 'lucide-react'

type Activity = {
  _id: string
  title: string
  description?: string
  eventDate?: string
  date?: string
  eventTime?: string
  time?: string
  location?: string
  imageUrl?: string
  image?: string
}

export default function ActivitiesPage() {
  const [events, setEvents] = useState<Activity[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Activity | null>(null)
  const baseUrl = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:4000'

  useEffect(() => {
    fetch(`${baseUrl}/api/home/activities`).then(r=>r.json()).then(setEvents).catch(()=>setEvents([]))
  }, [baseUrl])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedEvent) {
        setSelectedEvent(null)
      }
    }
    if (selectedEvent) {
      document.addEventListener('keydown', handleKeyPress)
      return () => document.removeEventListener('keydown', handleKeyPress)
    }
  }, [selectedEvent])

  const { upcoming, past } = useMemo(() => {
    const now = new Date()
    const up: Activity[] = []
    const pa: Activity[] = []
    events.forEach((e) => {
      const d = e.eventDate ? new Date(e.eventDate) : (e.date ? new Date(e.date) : null)
      if (d && d >= now) up.push(e); else pa.push(e)
    })
    return { upcoming: up, past: pa }
  }, [events])

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <Calendar className="mr-2 w-8 h-8 text-blue-600" />
        Activities
      </h2>

      <section className="mb-8">
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Upcoming Events</h3>
        {upcoming.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No upcoming events scheduled yet.</p>
          </div>
        ) : (
          upcoming.map((ev) => (
            <div key={ev._id} className="bg-blue-50 p-4 rounded-lg mb-4 border-l-4 border-blue-600 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xl font-bold text-blue-800">{ev.title}</h4>
                    <button
                      onClick={() => setSelectedEvent(ev)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                  {ev.description && <p className="text-gray-700 mt-2 line-clamp-2">{ev.description}</p>}
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                    {(ev.eventDate || ev.date) && (
                      <div className="flex items-center">
                        <Calendar className="inline mr-1 w-4 h-4" />
                        {new Date(ev.eventDate || ev.date || '').toLocaleDateString()}
                      </div>
                    )}
                    {(ev.eventTime || ev.time) && (
                      <div className="flex items-center">
                        <Clock className="inline mr-1 w-4 h-4" />
                        {ev.eventTime || ev.time}
                      </div>
                    )}
                    {ev.location && (
                      <div className="flex items-center">
                        <MapPin className="inline mr-1 w-4 h-4" />
                        {ev.location}
                      </div>
                    )}
                  </div>
                </div>
                {(ev.imageUrl || ev.image) && (
                  <div className="mt-4 md:mt-0 md:ml-4 cursor-pointer" onClick={() => setSelectedEvent(ev)}>
                    <img 
                      src={ev.imageUrl || ev.image} 
                      alt={ev.title} 
                      className="w-32 h-24 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      onError={(e) => {
                        console.error('Failed to load event image:', ev.imageUrl || ev.image)
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </section>

      <section>
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Past Activities</h3>
        {past.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No past activities to display yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {past.map((ev) => (
              <div 
                key={ev._id} 
                className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedEvent(ev)}
              >
                {(ev.imageUrl || ev.image) && (
                  <img 
                    src={ev.imageUrl || ev.image} 
                    alt={ev.title} 
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      console.error('Failed to load event image:', ev.imageUrl || ev.image)
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-800">{ev.title}</h4>
                    <Eye className="w-4 h-4 text-gray-400" />
                  </div>
                  {(ev.eventDate || ev.date) && (
                    <p className="text-sm text-gray-600 mb-2 flex items-center">
                      <Calendar className="inline mr-1 w-4 h-4" />
                      {new Date(ev.eventDate || ev.date || '').toLocaleDateString()}
                    </p>
                  )}
                  {ev.description && <p className="text-gray-700 text-sm line-clamp-2">{ev.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 bg-gray-800 hover:bg-gray-900 text-white p-2 rounded-full transition-all duration-200 z-20 shadow-lg"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              {/* Event Image */}
              {(selectedEvent.imageUrl || selectedEvent.image) && (
                <img 
                  src={selectedEvent.imageUrl || selectedEvent.image} 
                  alt={selectedEvent.title} 
                  className="w-full h-64 md:h-96 object-cover rounded-t-lg"
                  onError={(e) => {
                    console.error('Failed to load event image:', selectedEvent.imageUrl || selectedEvent.image)
                    e.currentTarget.style.display = 'none'
                  }}
                />
              )}
              
              {/* Event Content */}
              <div className="p-6 md:p-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{selectedEvent.title}</h2>
                
                {/* Event Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-200">
                  {(selectedEvent.eventDate || selectedEvent.date) && (
                    <div className="flex items-center text-gray-700">
                      <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-semibold">{new Date(selectedEvent.eventDate || selectedEvent.date || '').toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</p>
                      </div>
                    </div>
                  )}
                  {(selectedEvent.eventTime || selectedEvent.time) && (
                    <div className="flex items-center text-gray-700">
                      <Clock className="w-5 h-5 mr-2 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="font-semibold">{selectedEvent.eventTime || selectedEvent.time}</p>
                      </div>
                    </div>
                  )}
                  {selectedEvent.location && (
                    <div className="flex items-center text-gray-700">
                      <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-semibold">{selectedEvent.location}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Event Description */}
                {selectedEvent.description && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                      <Info className="w-5 h-5 mr-2 text-blue-600" />
                      About This Event
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedEvent.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
