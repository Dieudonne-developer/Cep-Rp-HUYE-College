import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLucideIcons } from '../../../utils/lucideIcons'

type Idea = {
  _id: string
  idea: string
  category: string
  submittedBy?: string
  email?: string
  anonymous: boolean
  status: 'pending' | 'approved' | 'rejected' | 'implemented'
  reviewedBy?: string
  reviewedAt?: string
  notes?: string
  implementationDetails?: string
  implementedDate?: string
  createdAt: string
}

export default function AdminIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const [formData, setFormData] = useState({
    status: 'pending' as const,
    notes: '',
    implementationDetails: ''
  })

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
  const groupQuery = adminGroup === 'anointed' ? 'group=anointed' : adminGroup === 'abanyamugisha' ? 'group=abanyamugisha' : adminGroup === 'psalm23' ? 'group=psalm23' : adminGroup === 'psalm46' ? 'group=psalm46' : adminGroup === 'protocol' ? 'group=protocol' : adminGroup === 'social' ? 'group=social' : adminGroup === 'evangelical' ? 'group=evangelical' : 'group=choir'
  const groupSuffix = typeof window !== 'undefined' && window.location.pathname.startsWith('/anointed/admin') ? '?group=anointed' : ''

  useEffect(() => {
    fetchIdeas()
  }, [])

  useLucideIcons()

  const fetchIdeas = async () => {
    try {
      const adminRaw = localStorage.getItem('admin')
      const admin = adminRaw ? JSON.parse(adminRaw) : {}
      const response = await fetch(`${baseUrl}/api/admin/ideas?${groupQuery}`, { headers: { 'X-Admin-Group': adminGroup, 'X-Admin-Email': admin?.email || '' } })
      const data = await response.json()
      setIdeas(data)
    } catch (error) {
      console.error('Failed to fetch ideas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReview = (idea: Idea) => {
    setSelectedIdea(idea)
    setFormData({
      status: idea.status,
      notes: idea.notes || '',
      implementationDetails: idea.implementationDetails || ''
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedIdea) return

    try {
      const adminRaw = localStorage.getItem('admin')
      const admin = adminRaw ? JSON.parse(adminRaw) : {}
      const response = await fetch(`${baseUrl}/api/admin/ideas/${selectedIdea._id}?${groupQuery}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Group': adminGroup, 'X-Admin-Email': admin?.email || '' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowModal(false)
        setSelectedIdea(null)
        setFormData({ status: 'pending', notes: '' })
        fetchIdeas()
      }
    } catch (error) {
      console.error('Failed to update idea:', error)
    }
  }

  const getStatusColor = (status: string) => {
    if (isAbanyamugishaAdmin) {
      switch (status) {
        case 'implemented': return 'bg-green-100 text-green-800'
        case 'approved': return 'bg-blue-100 text-blue-800'
        case 'rejected': return 'bg-red-100 text-red-800'
        case 'pending': return 'bg-yellow-100 text-yellow-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    } else {
      switch (status) {
        case 'implemented': return 'bg-blue-100 text-blue-800'
        case 'approved': return 'bg-green-100 text-green-800'
        case 'rejected': return 'bg-red-100 text-red-800'
        case 'pending': return 'bg-yellow-100 text-yellow-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'song': return 'bg-blue-100 text-blue-800'
      case 'performance': return 'bg-purple-100 text-purple-800'
      case 'event': return 'bg-green-100 text-green-800'
      case 'improvement': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white p-4 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
        <h1 className="text-3xl font-bold text-gray-800">{isAbanyamugishaAdmin ? 'Review Prayer Requests' : 'Review Ideas'}</h1>
        <div className="flex space-x-2">
          <span className="text-sm text-gray-600">
            {isAbanyamugishaAdmin ? (
              <>
                Total: {ideas.length} | Pending: {ideas.filter(i => i.status === 'pending').length} | 
                Answered: {ideas.filter(i => i.status === 'implemented').length}
              </>
            ) : (
              <>
                Total: {ideas.length} | Pending: {ideas.filter(i => i.status === 'pending').length} | 
                Implemented: {ideas.filter(i => i.status === 'implemented').length}
              </>
            )}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {ideas.map(idea => (
          <div key={idea._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex space-x-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(idea.category)}`}>
                  {idea.category}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(idea.status)}`}>
                  {isAbanyamugishaAdmin 
                    ? (idea.status === 'implemented' ? 'Answered' : idea.status === 'approved' ? 'Being Prayed For' : idea.status)
                    : idea.status}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(idea.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{isAbanyamugishaAdmin ? 'Prayer Request:' : 'Idea:'}</h3>
              <p className="text-gray-700 leading-relaxed">{idea.idea}</p>
            </div>

            {idea.submittedBy && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <strong>{isAbanyamugishaAdmin ? 'Requested by:' : 'Submitted by:'}</strong> {idea.submittedBy}
                  {idea.email && ` (${idea.email})`}
                </p>
              </div>
            )}

            {idea.notes && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Admin Notes:</h4>
                <p className="text-sm text-gray-600">{idea.notes}</p>
              </div>
            )}

            {idea.implementationDetails && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-700 mb-1">{isAbanyamugishaAdmin ? 'Prayer Answered Details:' : 'Implementation Details:'}</h4>
                <p className="text-sm text-blue-600">{idea.implementationDetails}</p>
                {idea.implementedDate && (
                  <p className="text-xs text-blue-500 mt-1">
                    {isAbanyamugishaAdmin ? 'Answered on' : 'Implemented on'} {new Date(idea.implementedDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {idea.reviewedAt && (
              <div className="text-xs text-gray-500 mb-4">
                Reviewed on {new Date(idea.reviewedAt).toLocaleDateString()}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => handleReview(idea)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <i data-lucide="edit" className="w-4 h-4 mr-2"></i>
                {idea.status === 'pending' ? (isAbanyamugishaAdmin ? 'Review Prayer' : 'Review') : (isAbanyamugishaAdmin ? 'Update Prayer' : 'Update Review')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {ideas.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          {isAbanyamugishaAdmin 
            ? 'No prayer requests found. Prayer requests submitted by the public will appear here for review.' 
            : 'No ideas found. Ideas submitted by the public will appear here for review.'}
        </div>
      )}

      {/* Review Modal */}
      {showModal && selectedIdea && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">{isAbanyamugishaAdmin ? 'Review Prayer Request' : 'Review Idea'}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i data-lucide="x" className="w-6 h-6"></i>
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">{isAbanyamugishaAdmin ? 'Original Prayer Request:' : 'Original Idea:'}</h4>
              <p className="text-sm text-gray-600">{selectedIdea.idea}</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {isAbanyamugishaAdmin ? (
                    <>
                      <option value="pending">Pending</option>
                      <option value="approved">Being Prayed For</option>
                      <option value="rejected">Rejected</option>
                      <option value="implemented">Answered</option>
                    </>
                  ) : (
                    <>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="implemented">Implemented</option>
                    </>
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={isAbanyamugishaAdmin ? 'Add notes about this prayer request...' : 'Add notes about this idea...'}
                />
              </div>
              
              {formData.status === 'implemented' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{isAbanyamugishaAdmin ? 'Prayer Answered Details' : 'Implementation Details'}</label>
                  <textarea
                    value={formData.implementationDetails}
                    onChange={(e) => setFormData({...formData, implementationDetails: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={isAbanyamugishaAdmin ? 'Describe how this prayer was answered...' : 'Describe how this idea was implemented...'}
                  />
                </div>
              )}
              
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
