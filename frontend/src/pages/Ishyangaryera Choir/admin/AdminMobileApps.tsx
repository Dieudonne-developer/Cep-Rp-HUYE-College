import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiBaseUrl } from '../../../utils/api'

interface MobileAppVersion {
  id: string
  appType: 'user' | 'admin'
  version: string
  versionCode: number
  downloadUrl: string
  fileName: string
  fileSize: number
  uploadedBy: string
  uploadedAt: string
  isActive: boolean
}

export default function AdminMobileApps() {
  const navigate = useNavigate()
  const baseUrl = getApiBaseUrl()
  const [versions, setVersions] = useState<MobileAppVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    appType: 'user' as 'user' | 'admin',
    version: '',
    versionCode: '',
    releaseNotes: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const adminData = (() => {
    try {
      const raw = localStorage.getItem('admin')
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })()

  useEffect(() => {
    if (!adminData) {
      navigate('/admin/login')
      return
    }
    fetchVersions()
  }, [adminData, navigate])

  const fetchVersions = async () => {
    try {
      const token = adminData?.token
      const res = await fetch(`${baseUrl}/api/admin/mobile-app/versions`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setVersions(data.versions)
      }
    } catch (err) {
      console.error('Error fetching versions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      setError('Please select an APK file')
      return
    }
    if (!form.version || !form.versionCode) {
      setError('Please fill in version and version code')
      return
    }

    setUploading(true)
    setError('')

    try {
      const token = adminData?.token
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('appType', form.appType)
      formData.append('version', form.version)
      formData.append('versionCode', form.versionCode)

      const res = await fetch(`${baseUrl}/api/admin/mobile-app/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      const data = await res.json()

      if (data.success) {
        alert('App uploaded successfully!')
        setForm({ appType: 'user', version: '', versionCode: '', releaseNotes: '' })
        setSelectedFile(null)
        fetchVersions()
      } else {
        setError(data.message || 'Upload failed')
      }
    } catch (err: any) {
      setError(err?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Mobile App Management</h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload Form */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Upload New Version</h3>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">App Type</label>
              <select
                value={form.appType}
                onChange={(e) => setForm({ ...form, appType: e.target.value as 'user' | 'admin' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="user">User App (CEP APP)</option>
                <option value="admin">Admin App (Admin CEP)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
              <input
                type="text"
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
                placeholder="1.0.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Version Code</label>
              <input
                type="number"
                value={form.versionCode}
                onChange={(e) => setForm({ ...form, versionCode: e.target.value })}
                placeholder="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">APK File</label>
              <input
                type="file"
                accept=".apk"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              {uploading ? 'Uploading...' : 'Upload App'}
            </button>
          </form>
        </div>

        {/* Versions List */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Uploaded Versions</h3>
          {loading ? (
            <p className="text-gray-600">Loading...</p>
          ) : versions.length === 0 ? (
            <p className="text-gray-600">No versions uploaded yet.</p>
          ) : (
            <div className="space-y-3">
              {versions.map((v) => (
                <div key={v.id} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {v.appType === 'user' ? 'CEP APP' : 'Admin CEP'} v{v.version}
                      </p>
                      <p className="text-sm text-gray-600">
                        Code: {v.versionCode} | Size: {formatFileSize(v.fileSize)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Uploaded by {v.uploadedBy} on {new Date(v.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <a
                      href={v.downloadUrl}
                      download={v.fileName}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
