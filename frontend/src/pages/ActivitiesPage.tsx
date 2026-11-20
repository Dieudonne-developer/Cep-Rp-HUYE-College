import React, { useEffect, useState } from 'react'
import { Calendar, Clock, MapPin, Info, Eye, X } from 'lucide-react'
import { getApiBaseUrl } from '../utils/api'
import ActivitiesGrid from '../components/ActivitiesGrid'

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
  status?: string
}

export default function ActivitiesPage() {
  const [events, setEvents] = useState<Activity[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Activity | null>(null)
  const baseUrl = getApiBaseUrl()

  useEffect(() => {
    fetch(`${baseUrl}/api/home/activities`).then(r=>r.json()).then(d=>setEvents(Array.isArray(d)?d:[])).catch(()=>setEvents([]))
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


  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <Calendar className="mr-2 w-8 h-8 text-blue-600" />
        Activities
      </h2>

            <ActivitiesGrid items={events} onView={setSelectedEvent} />

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
