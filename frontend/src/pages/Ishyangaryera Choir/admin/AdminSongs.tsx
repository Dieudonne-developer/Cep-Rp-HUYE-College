import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLucideIcons } from '../../../utils/lucideIcons'

type Song = {
  _id: string
  title: string
  url: string
  mediaType: 'audio' | 'video'
  downloadable: boolean
  description?: string
  category?: string
  thumbnail?: string
  createdAt: string
}

export default function AdminSongs() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [editingSong, setEditingSong] = useState<Song | null>(null)
  const [uploading, setUploading] = useState(false)

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
  const adminGroup = (() => {
    try {
      const raw = localStorage.getItem('admin')
      if (!raw) return 'choir'
      const obj = JSON.parse(raw)
      return obj?.adminGroup || 'choir'
    } catch { return 'choir' }
  })()
  const isProtocolAdmin = adminGroup === 'protocol'
  const isEvangelicalAdmin = adminGroup === 'evangelical'
  const isPsalm23Admin = adminGroup === 'psalm23'
  const isPsalm46Admin = adminGroup === 'psalm46'
  const isPsalmAdmin = isPsalm23Admin || isPsalm46Admin
  const isAbanyamugishaAdmin = adminGroup === 'abanyamugisha'
  const groupQuery = adminGroup === 'anointed' ? 'group=anointed' : adminGroup === 'abanyamugisha' ? 'group=abanyamugisha' : adminGroup === 'psalm23' ? 'group=psalm23' : adminGroup === 'psalm46' ? 'group=psalm46' : adminGroup === 'protocol' ? 'group=protocol' : adminGroup === 'social' ? 'group=social' : adminGroup === 'evangelical' ? 'group=evangelical' : 'group=choir'

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    mediaType: (isProtocolAdmin || isPsalmAdmin ? 'video' : 'audio') as 'audio' | 'video',
    downloadable: false,
    description: '',
    category: '',
    thumbnail: ''
  })
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    category: '',
    mediaType: (isProtocolAdmin || isPsalmAdmin ? 'video' : 'audio') as 'audio' | 'video',
    downloadable: false,
    file: null as File | null
  })

  useEffect(() => {
    fetchSongs()
  }, [])

  useLucideIcons()

  const fetchSongs = async () => {
    try {
      const adminRaw = localStorage.getItem('admin')
      const admin = adminRaw ? JSON.parse(adminRaw) : {}
      const response = await fetch(`${baseUrl}/api/admin/songs?${groupQuery}`, { headers: { 'X-Admin-Group': adminGroup, 'X-Admin-Email': admin?.email || '' } })
      const data = await response.json()
      // For Protocol and Psalm admins, only show videos
      const filteredData = (isProtocolAdmin || isPsalmAdmin) ? data.filter((song: Song) => song.mediaType === 'video') : data
      setSongs(filteredData)
    } catch (error) {
      console.error('Failed to fetch songs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingSong 
        ? `${baseUrl}/api/admin/songs/${editingSong._id}?${groupQuery}`
        : `${baseUrl}/api/admin/songs?${groupQuery}`
      
      const method = editingSong ? 'PUT' : 'POST'
      
      const adminRaw = localStorage.getItem('admin')
      const admin = adminRaw ? JSON.parse(adminRaw) : {}
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'X-Admin-Id': admin?.id || '', 'X-Admin-Email': admin?.email || '' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowModal(false)
        setEditingSong(null)
        setFormData({ title: '', url: '', mediaType: (isProtocolAdmin || isPsalmAdmin ? 'video' : 'audio') as 'audio' | 'video', downloadable: false, description: '', category: '', thumbnail: '' })
        fetchSongs()
      }
    } catch (error) {
      console.error('Failed to save song:', error)
    }
  }

  const handleEdit = (song: Song) => {
    setEditingSong(song)
    setFormData({
      title: song.title,
      url: song.url,
      mediaType: song.mediaType,
      downloadable: song.downloadable,
      description: song.description || '',
      category: song.category || '',
      thumbnail: song.thumbnail || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    const confirmMessage = isProtocolAdmin ? 'Are you sure you want to delete this decorating video?' : isEvangelicalAdmin ? 'Are you sure you want to delete this Bible teaching?' : isPsalmAdmin ? 'Are you sure you want to delete this video?' : isAbanyamugishaAdmin ? 'Are you sure you want to delete this testimony?' : 'Are you sure you want to delete this song?'
    if (!confirm(confirmMessage)) return
    
    try {
      const adminRaw = localStorage.getItem('admin')
      const admin = adminRaw ? JSON.parse(adminRaw) : {}
      await fetch(`${baseUrl}/api/admin/songs/${id}?${groupQuery}`, { method: 'DELETE', headers: { 'X-Admin-Group': adminGroup, 'X-Admin-Email': admin?.email || '' } })
      fetchSongs()
    } catch (error) {
      console.error('Failed to delete song:', error)
    }
  }

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadData.file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', uploadData.file)
      formData.append('title', uploadData.title)
      formData.append('description', uploadData.description)
      formData.append('category', uploadData.category)
      formData.append('mediaType', uploadData.mediaType)
      formData.append('downloadable', uploadData.downloadable.toString())

      const adminRaw = localStorage.getItem('admin')
      const admin = adminRaw ? JSON.parse(adminRaw) : {}
      const response = await fetch(`${baseUrl}/api/admin/songs/upload?${groupQuery}`, {
        method: 'POST',
        headers: { 'X-Admin-Id': admin?.id || '', 'X-Admin-Email': admin?.email || '' },
        body: formData
      })

      if (response.ok) {
        setShowUploadModal(false)
        setUploadData({ title: '', description: '', category: '', mediaType: (isProtocolAdmin || isPsalmAdmin ? 'video' : 'audio') as 'audio' | 'video', downloadable: false, file: null })
        fetchSongs()
      } else {
        const error = await response.json()
        alert('Upload failed: ' + error.message)
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setUploadData({ ...uploadData, file })
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

  const pageTitle = isProtocolAdmin ? 'Manage Decorating' : isEvangelicalAdmin ? 'Manage Today\'s Bible teaching' : isPsalmAdmin ? 'Manage Videos' : isAbanyamugishaAdmin ? 'Manage Testimony of God\'s works' : 'Manage Songs'
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{pageTitle}</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setEditingSong(null)
              setFormData({ title: '', url: '', mediaType: (isProtocolAdmin || isPsalmAdmin ? 'video' : 'audio') as 'audio' | 'video', downloadable: false, description: '', category: '', thumbnail: '' })
              setShowModal(true)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <i data-lucide="link" className="w-4 h-4 mr-2"></i> {isProtocolAdmin ? 'Add Video URL' : isEvangelicalAdmin ? 'Add Teaching URL' : isPsalmAdmin ? 'Add Video URL' : isAbanyamugishaAdmin ? 'Add Testimony URL' : 'Add URL'}
          </button>
          <button
            onClick={() => {
              setUploadData({ title: '', description: '', category: '', mediaType: (isProtocolAdmin || isPsalmAdmin ? 'video' : 'audio') as 'audio' | 'video', downloadable: false, file: null })
              setShowUploadModal(true)
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <i data-lucide="upload" className="w-4 h-4 mr-2"></i> {isProtocolAdmin ? 'Upload Video' : isEvangelicalAdmin ? 'Upload Teaching' : isPsalmAdmin ? 'Upload Video' : isAbanyamugishaAdmin ? 'Upload Testimony' : 'Upload File'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Downloadable</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {songs.map(song => (
              <tr key={song._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{song.title}</div>
                  {song.description && (
                    <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">{song.description}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    song.mediaType === 'video' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    <i data-lucide={song.mediaType === 'video' ? 'video' : 'music'} className="w-3 h-3 mr-1"></i>
                    {song.mediaType === 'video' ? 'Video' : 'Audio'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{song.category || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <a 
                    href={song.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <i data-lucide="external-link" className="w-4 h-4 inline mr-1"></i>
                    View Link
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    song.downloadable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {song.downloadable ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(song.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(song)}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      title="Edit song"
                    >
                      <i data-lucide="edit" className="w-4 h-4 mr-1"></i>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(song._id)}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                      title="Delete song"
                    >
                      <i data-lucide="trash-2" className="w-4 h-4 mr-1"></i>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {songs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {isProtocolAdmin ? 'No decorating videos found. Add your first video to get started.' : isEvangelicalAdmin ? 'No Bible teachings found. Add your first teaching to get started.' : isPsalmAdmin ? 'No videos found. Add your first video to get started.' : isAbanyamugishaAdmin ? 'No testimonies found. Add your first testimony to get started.' : 'No songs found. Add your first song to get started.'}
          </div>
        )}
      </div>

      {/* Add/Edit Song Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editingSong ? (isProtocolAdmin ? 'Edit Decorating Video' : isEvangelicalAdmin ? 'Edit Bible Teaching' : isPsalmAdmin ? 'Edit Video' : isAbanyamugishaAdmin ? 'Edit Testimony' : 'Edit Song') : (isProtocolAdmin ? 'Add New Decorating Video' : isEvangelicalAdmin ? 'Add New Bible Teaching' : isPsalmAdmin ? 'Add New Video' : isAbanyamugishaAdmin ? 'Add New Testimony' : 'Add New Song')}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Song/Video title"
                />
              </div>
              
              {!isProtocolAdmin && !isPsalmAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Media Type *</label>
                  <select
                    value={formData.mediaType}
                    onChange={(e) => setFormData({...formData, mediaType: e.target.value as 'audio' | 'video'})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL *</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={formData.mediaType === 'video' ? 'https://youtube.com/watch?v=...' : 'https://example.com/song.mp3'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Worship, Hymns, Contemporary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the song/video"
                />
              </div>
              
              {formData.mediaType === 'video' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail URL</label>
                  <input
                    type="url"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                </div>
              )}
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="downloadable"
                  checked={formData.downloadable}
                  onChange={(e) => setFormData({...formData, downloadable: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="downloadable" className="ml-2 block text-sm text-gray-900">
                  Allow downloads
                </label>
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingSong ? (isProtocolAdmin ? 'Update Video' : isEvangelicalAdmin ? 'Update Teaching' : isPsalmAdmin ? 'Update Video' : isAbanyamugishaAdmin ? 'Update Testimony' : 'Update Song') : (isProtocolAdmin ? 'Add Video' : isEvangelicalAdmin ? 'Add Teaching' : isPsalmAdmin ? 'Add Video' : isAbanyamugishaAdmin ? 'Add Testimony' : 'Add Song')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">{isProtocolAdmin ? 'Upload Decorating Video' : isEvangelicalAdmin ? 'Upload Bible Teaching' : isPsalmAdmin ? 'Upload Video' : isAbanyamugishaAdmin ? 'Upload Testimony' : 'Upload Song/Video'}</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i data-lucide="x" className="w-6 h-6"></i>
              </button>
            </div>
            
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">File *</label>
                <input
                  type="file"
                  accept={uploadData.mediaType === 'video' ? 'video/*' : 'audio/*'}
                  onChange={handleFileChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: {uploadData.mediaType === 'video' ? 'MP4, AVI, MOV, WMV, WebM' : 'MP3, WAV, OGG, M4A'} (Max 100MB)
                </p>
              </div>

              {!isProtocolAdmin && !isPsalmAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select
                    value={uploadData.mediaType}
                    onChange={(e) => setUploadData({...uploadData, mediaType: e.target.value as 'audio' | 'video'})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Song/Video title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={uploadData.category}
                  onChange={(e) => setUploadData({...uploadData, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Worship, Hymns, Contemporary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Brief description of the song/video"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="upload-downloadable"
                  checked={uploadData.downloadable}
                  onChange={(e) => setUploadData({...uploadData, downloadable: e.target.checked})}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="upload-downloadable" className="ml-2 block text-sm text-gray-900">
                  Allow downloads
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadData.file}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {uploading ? (
                    <>
                      <i data-lucide="loader-2" className="w-4 h-4 mr-2 animate-spin"></i>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <i data-lucide="upload" className="w-4 h-4 mr-2"></i>
                      Upload File
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
