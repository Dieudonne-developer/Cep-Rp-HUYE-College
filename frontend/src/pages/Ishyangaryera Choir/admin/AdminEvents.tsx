import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLucideIcons } from '../../../utils/lucideIcons'

type Event = {
  _id: string
  title: string
  description: string
  eventDate: string
  eventTime?: string
  location: string
  imageUrl?: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  createdAt: string
}

export default function AdminEvents() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
  const adminGroup = (() => {
    try {
      const raw = localStorage.getItem('admin')
      if (!raw) return 'choir'
      const obj = JSON.parse(raw)
      return obj?.adminGroup || 'choir'
    } catch { return 'choir' }
  })()
  const isAbanyamugishaAdmin = adminGroup === 'abanyamugisha'

  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
    location: '',
    imageUrl: '',
    status: (isAbanyamugishaAdmin ? 'completed' : 'upcoming') as 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  })
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const groupQuery = adminGroup === 'anointed' ? 'group=anointed' : adminGroup === 'abanyamugisha' ? 'group=abanyamugisha' : adminGroup === 'psalm23' ? 'group=psalm23' : adminGroup === 'psalm46' ? 'group=psalm46' : adminGroup === 'protocol' ? 'group=protocol' : adminGroup === 'social' ? 'group=social' : adminGroup === 'evangelical' ? 'group=evangelical' : 'group=choir'
  const groupSuffix = typeof window !== 'undefined' && window.location.pathname.startsWith('/anointed/admin') ? '?group=anointed' : ''

  useEffect(() => {
    fetchEvents()
  }, [])

  useLucideIcons()

  const fetchEvents = async () => {
    try {
      const adminRaw = localStorage.getItem('admin')
      const admin = adminRaw ? JSON.parse(adminRaw) : {}
      const response = await fetch(`${baseUrl}/api/admin/events?${groupQuery}`, { headers: { 'X-Admin-Group': adminGroup, 'X-Admin-Email': admin?.email || '' } })
      const data = await response.json()
      setEvents(data)
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    const adminRaw = localStorage.getItem('admin')
    const admin = adminRaw ? JSON.parse(adminRaw) : {}
    
    const response = await fetch(`${baseUrl}/api/admin/events/upload?${groupQuery}`, {
      method: 'POST',
      headers: { 'X-Admin-Id': admin?.id || '', 'X-Admin-Email': admin?.email || '' },
      body: formData
    })
    
    if (!response.ok) {
      throw new Error('Failed to upload image')
    }
    
    const data = await response.json()
    return data.url
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    
    try {
      let imageUrl = formData.imageUrl
      
      // Upload file if selected
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile)
      }
      
      const url = editingEvent 
        ? `${baseUrl}/api/admin/events/${editingEvent._id}?${groupQuery}`
        : `${baseUrl}/api/admin/events?${groupQuery}`
      
      const method = editingEvent ? 'PUT' : 'POST'
      
      const adminRaw = localStorage.getItem('admin')
      const admin = adminRaw ? JSON.parse(adminRaw) : {}
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'X-Admin-Id': admin?.id || '', 'X-Admin-Email': admin?.email || '' },
        body: JSON.stringify({ ...formData, imageUrl })
      })

      if (response.ok) {
        setShowModal(false)
        setEditingEvent(null)
        setFormData({ title: '', description: '', eventDate: '', eventTime: '', location: '', imageUrl: '', status: (isAbanyamugishaAdmin ? 'completed' : 'upcoming') as any })
        setSelectedFile(null)
        setPreviewUrl(null)
        fetchEvents()
      }
    } catch (error) {
      console.error('Failed to save event:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    // Safely handle eventDate - fallback to createdAt if eventDate doesn't exist
    const dateValue = event.eventDate || event.createdAt || new Date().toISOString()
    const dateStr = typeof dateValue === 'string' ? dateValue.split('T')[0] : new Date(dateValue).toISOString().split('T')[0]
    setFormData({
      title: event.title,
      description: event.description || '',
      eventDate: dateStr,
      eventTime: event.eventTime || '',
      location: event.location,
      imageUrl: event.imageUrl || '',
      status: event.status
    })
    setSelectedFile(null)
    setPreviewUrl(null)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(isAbanyamugishaAdmin ? 'Are you sure you want to delete this answered prayer?' : 'Are you sure you want to delete this event?')) return
    
    try {
      const adminRaw = localStorage.getItem('admin')
      const admin = adminRaw ? JSON.parse(adminRaw) : {}
      await fetch(`${baseUrl}/api/admin/events/${id}?${groupQuery}`, { method: 'DELETE', headers: { 'X-Admin-Group': adminGroup, 'X-Admin-Email': admin?.email || '' } })
      fetchEvents()
    } catch (error) {
      console.error('Failed to delete event:', error)
    }
  }

  const getStatusColor = (status: string) => {
    if (isAbanyamugishaAdmin) {
      switch (status) {
        case 'completed': return 'bg-green-100 text-green-800'
        case 'ongoing': return 'bg-purple-100 text-purple-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    } else {
      switch (status) {
        case 'upcoming': return 'bg-blue-100 text-blue-800'
        case 'ongoing': return 'bg-green-100 text-green-800'
        case 'completed': return 'bg-gray-100 text-gray-800'
        case 'cancelled': return 'bg-red-100 text-red-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{isAbanyamugishaAdmin ? 'Manage Prayers answered by God' : 'Manage Events'}</h1>
        <button
          onClick={() => {
            setEditingEvent(null)
            setFormData({ title: '', description: '', eventDate: '', eventTime: '', location: '', imageUrl: '', status: (isAbanyamugishaAdmin ? 'completed' : 'upcoming') as any })
            setShowModal(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <i data-lucide="plus" className="w-4 h-4 mr-2"></i> {isAbanyamugishaAdmin ? 'Add Prayer Answered' : 'Add Event'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {event.imageUrl && (
              <img 
                src={event.imageUrl} 
                alt={event.title} 
                className="w-full h-48 object-cover"
                onError={(e) => {
                  console.error('Failed to load event image:', event.imageUrl)
                  // Hide broken images by setting display to none
                  e.currentTarget.style.display = 'none'
                }}
              />
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-800">{event.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(event.status)}`}>
                  {isAbanyamugishaAdmin 
                    ? (event.status === 'completed' ? 'Answered' : event.status === 'ongoing' ? 'Testimony' : event.status)
                    : event.status}
                </span>
              </div>
              
              <div className="flex items-center text-gray-600 mb-2">
                <i data-lucide="calendar" className="w-4 h-4 mr-2"></i>
                <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                {event.eventTime && (
                  <span className="ml-2">• {event.eventTime}</span>
                )}
              </div>
              
              <div className="flex items-center text-gray-600 mb-4">
                <i data-lucide="map-pin" className="w-4 h-4 mr-2"></i>
                <span>{event.location}</span>
              </div>
              
              {event.description && (
                <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
              )}
              
              <div className="flex justify-between items-center">
                <button
                  onClick={() => handleEdit(event)}
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <i data-lucide="edit" className="w-4 h-4 mr-1"></i> Edit
                </button>
                <button
                  onClick={() => handleDelete(event._id)}
                  className="text-red-600 hover:text-red-800 flex items-center"
                >
                  <i data-lucide="trash-2" className="w-4 h-4 mr-1"></i> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          {isAbanyamugishaAdmin ? 'No prayers answered found. Add your first answered prayer to get started.' : 'No events found. Add your first event to get started.'}
        </div>
      )}

      {/* Add/Edit Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editingEvent ? (isAbanyamugishaAdmin ? 'Edit Prayer Answered' : 'Edit Event') : (isAbanyamugishaAdmin ? 'Add New Prayer Answered' : 'Add New Event')}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i data-lucide="x" className="w-6 h-6"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{isAbanyamugishaAdmin ? 'Prayer Title *' : 'Title *'}</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  placeholder={isAbanyamugishaAdmin ? 'e.g., Healing prayer answered' : ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{isAbanyamugishaAdmin ? 'Date Answered *' : 'Date *'}</label>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={formData.eventTime}
                    onChange={(e) => setFormData({...formData, eventTime: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{isAbanyamugishaAdmin ? 'Location/Circumstance *' : 'Location *'}</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                  placeholder={isAbanyamugishaAdmin ? 'e.g., Hospital, Home, Church' : ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{isAbanyamugishaAdmin ? 'Prayer Image' : 'Event Image'}</label>
                
                {/* File Upload */}
                <div className="mb-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: JPG, PNG, GIF. Max size: 10MB
                  </p>
                </div>

                {/* Preview */}
                {previewUrl && (
                  <div className="mb-4">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null)
                        setPreviewUrl(null)
                      }}
                      className="mt-2 text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove image
                    </button>
                  </div>
                )}

                {/* Current image (when editing) */}
                {editingEvent && editingEvent.imageUrl && !previewUrl && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Current image:</p>
                    <img 
                      src={editingEvent.imageUrl} 
                      alt="Current" 
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                  </div>
                )}

                {/* Fallback URL input */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or enter image URL (if not uploading file)
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {isAbanyamugishaAdmin ? (
                    <>
                      <option value="completed">Answered</option>
                      <option value="ongoing">Testimony</option>
                    </>
                  ) : (
                    <>
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </>
                  )}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {uploading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {uploading ? 'Uploading...' : (editingEvent ? (isAbanyamugishaAdmin ? 'Update Prayer' : 'Update Event') : (isAbanyamugishaAdmin ? 'Add Prayer' : 'Add Event'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
