import React, { useEffect, useState } from 'react'
import { getApiBaseUrl } from '../../../utils/api'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLucideIcons } from '../../../utils/lucideIcons'

type Admin = {
  _id: string
  email: string
  username: string
  role: string
  adminGroup: string
  isVerified: boolean
  isApproved: boolean
  createdAt: string
  approvedAt?: string
  approvedBy?: string
  profileImage?: string
}

const ALL_GROUPS = [
  { value: 'cepier', label: 'CEP' },
  { value: 'choir', label: 'Choir' },
  { value: 'anointed', label: 'Anointed' },
  { value: 'abanyamugisha', label: 'Abanyamugisha' },
  { value: 'psalm23', label: 'Psalm 23' },
  { value: 'psalm46', label: 'Psalm 46' },
  { value: 'protocol', label: 'Protocol' },
  { value: 'social', label: 'Social' },
  { value: 'evangelical', label: 'Evangelical' }
]

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
  { value: 'super-admin', label: 'Super Admin' }
]

export default function AdminSuperAdmins() {
  const location = useLocation()
  const navigate = useNavigate()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filterGroup, setFilterGroup] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  // Main tab: 'admins' or 'homepage'
  const [mainTab, setMainTab] = useState<'admins'|'homepage'|'slides'>('admins')
  // Global content management state
  const [activeGlobalTab, setActiveGlobalTab] = useState<'activities'|'ideas'|'support'|'slides'|'cepier-members'>('activities')
  const [globalActivities, setGlobalActivities] = useState<any[]>([])
  const [savingActivity, setSavingActivity] = useState(false)
  const [activityForm, setActivityForm] = useState({ title: '', description: '', eventDate: '', eventTime: '', location: '', imageUrl: '' })
  const [activityImgUploading, setActivityImgUploading] = useState(false)
  const [globalIdeas, setGlobalIdeas] = useState<any[]>([])
  const [supportDoc, setSupportDoc] = useState<any>(null)
  const [savingSupport, setSavingSupport] = useState(false)
  const [slides, setSlides] = useState<any[]>([])
  const [slideForm, setSlideForm] = useState({ imageUrl: '', caption: '' })
  const [slideImgUploading, setSlideImgUploading] = useState(false)
  const [savingSlide, setSavingSlide] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    contactNumber: '',
    adminGroup: 'choir',
    role: 'admin'
  })

  const baseUrl = getApiBaseUrl()
  const adminRaw = localStorage.getItem('admin')
  const currentAdmin = adminRaw ? JSON.parse(adminRaw) : {}

  useEffect(() => {
    fetchAdmins()
  }, [])
  // Sync tabs from query param and keep URL updated
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const mainTabParam = params.get('tab') || params.get('global') ? 'homepage' : 'admins'
    const globalTab = params.get('global') || 'activities'
    
    if (mainTabParam === 'homepage') {
      if (['activities','ideas','support','slides','cepier-members'].includes(globalTab)) {
        setMainTab('homepage')
        setActiveGlobalTab(globalTab as any)
      } else {
        setMainTab('homepage')
        setActiveGlobalTab('activities')
      }
    } else {
      setMainTab('admins')
    }
  }, [location.search])
  
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (mainTab === 'homepage') {
      params.set('tab', 'homepage')
      if (activeGlobalTab && (params.get('global') || '') !== activeGlobalTab) {
        params.set('global', activeGlobalTab)
        navigate({ pathname: '/admin/super-admins', search: params.toString() }, { replace: true })
      }
    } else {
      params.delete('tab')
      params.delete('global')
      navigate({ pathname: '/admin/super-admins', search: params.toString() }, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainTab, activeGlobalTab])

  useLucideIcons()

  const fetchAdmins = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/admin/super-admins`, {
        headers: {
          'X-Admin-Email': currentAdmin?.email || '',
          'X-Admin-Group': currentAdmin?.adminGroup || ''
        }
      })
      const data = await response.json()
      if (data.success) {
        setAdmins(data.admins)
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error)
    } finally {
      setLoading(false)
    }
  }

  // ===== Global content management calls =====
  async function fetchGlobalActivities() {
    try {
      const res = await fetch(`${baseUrl}/api/admin/super-admin/home/activities`, { headers: { 'X-Admin-Email': currentAdmin?.email || '' } })
      const data = await res.json()
      if (data.success) setGlobalActivities(data.events || [])
    } catch {}
  }
  async function uploadActivityImage(file: File) {
    setActivityImgUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`${baseUrl}/api/admin/events/upload`, {
        method: 'POST',
        headers: { 'X-Admin-Email': currentAdmin?.email || '' },
        body: fd,
      })
      const data = await res.json()
      if (data.url || data.fileUrl) setActivityForm(f => ({ ...f, imageUrl: data.url || data.fileUrl }))
      else alert(data.message || 'Image upload failed')
    } catch { alert('Image upload failed') }
    setActivityImgUploading(false)
  }
  async function createGlobalActivity(e: React.FormEvent) {
    e.preventDefault(); setSavingActivity(true)
    try {
      const res = await fetch(`${baseUrl}/api/admin/super-admin/home/activities`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Admin-Email': currentAdmin?.email || '' }, body: JSON.stringify(activityForm)
      })
      const data = await res.json(); if (data.success) { setActivityForm({ title:'', description:'', eventDate:'', eventTime:'', location:'', imageUrl:'' }); fetchGlobalActivities() } else alert(data.message||'Failed to create')
    } catch { alert('Failed to create') } finally { setSavingActivity(false) }
  }
  async function deleteGlobalActivity(id: string) {
    if (!confirm('Delete this activity?')) return
    await fetch(`${baseUrl}/api/admin/super-admin/home/activities/${id}`, { method:'DELETE', headers:{ 'X-Admin-Email': currentAdmin?.email || '' } })
    fetchGlobalActivities()
  }
  async function fetchGlobalIdeas() {
    try {
      const res = await fetch(`${baseUrl}/api/admin/super-admin/home/ideas`, { headers:{ 'X-Admin-Email': currentAdmin?.email || '' } })
      const data = await res.json(); if (data.success) setGlobalIdeas(data.ideas || [])
    } catch {}
  }
  async function implementGlobalIdea(id: string) {
    await fetch(`${baseUrl}/api/admin/super-admin/home/ideas/${id}/implement`, { method:'PUT', headers:{ 'X-Admin-Email': currentAdmin?.email || '' } })
    fetchGlobalIdeas()
  }
  async function deleteGlobalIdea(id: string) {
    if (!confirm('Delete this idea?')) return
    await fetch(`${baseUrl}/api/admin/super-admin/home/ideas/${id}`, { method:'DELETE', headers:{ 'X-Admin-Email': currentAdmin?.email || '' } })
    fetchGlobalIdeas()
  }
  async function fetchSupport() {
    try {
      const res = await fetch(`${baseUrl}/api/admin/super-admin/home/support`, { headers:{ 'X-Admin-Email': currentAdmin?.email || '' } })
      const data = await res.json(); if (data.success) setSupportDoc(data.support)
    } catch {}
  }
  async function fetchSlides() {
    try {
      const res = await fetch(`${baseUrl}/api/admin/super-admin/home/slides`, { headers:{ 'X-Admin-Email': currentAdmin?.email || '' } })
      const data = await res.json(); if (data.success) setSlides(data.slides || [])
    } catch {}
  }
  async function uploadSlideImage(file: File) {
    setSlideImgUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`${baseUrl}/api/admin/super-admin/home/slides/upload`, {
        method: 'POST',
        headers: { 'X-Admin-Email': currentAdmin?.email || '' },
        body: fd,
      })
      const data = await res.json()
      if (data.url || data.fileUrl) setSlideForm(f => ({ ...f, imageUrl: data.url || data.fileUrl }))
      else alert(data.message || 'Image upload failed')
    } catch { alert('Image upload failed') }
    setSlideImgUploading(false)
  }
  async function createSlide(e: React.FormEvent) {
    e.preventDefault(); setSavingSlide(true)
    try {
      const res = await fetch(`${baseUrl}/api/admin/super-admin/home/slides`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Admin-Email': currentAdmin?.email || '' },
        body: JSON.stringify({ imageUrl: slideForm.imageUrl, caption: slideForm.caption || undefined })
      })
      const data = await res.json()
      if (data.success) { setSlideForm({ imageUrl:'', caption:'' }); fetchSlides() } else alert(data.message||'Failed to add slide')
    } catch { alert('Failed to add slide') } finally { setSavingSlide(false) }
  }
  async function toggleSlide(id: string, isActive: boolean) {
    await fetch(`${baseUrl}/api/admin/super-admin/home/slides/${id}`, { method:'PUT', headers:{ 'Content-Type':'application/json', 'X-Admin-Email': currentAdmin?.email || '' }, body: JSON.stringify({ isActive: !isActive }) })
    fetchSlides()
  }
  async function deleteSlide(id: string) {
    if (!confirm('Delete this slide image?')) return
    await fetch(`${baseUrl}/api/admin/super-admin/home/slides/${id}`, { method:'DELETE', headers:{ 'X-Admin-Email': currentAdmin?.email || '' } })
    fetchSlides()
  }

  async function saveSupport(e: React.FormEvent) {
    e.preventDefault(); setSavingSupport(true)
    try {
      const res = await fetch(`${baseUrl}/api/admin/super-admin/home/support`, { method:'PUT', headers:{ 'Content-Type':'application/json', 'X-Admin-Email': currentAdmin?.email || '' }, body: JSON.stringify(supportDoc || {}) })
      const data = await res.json(); if (!data.success) alert(data.message||'Failed to save')
    } catch { alert('Failed to save') } finally { setSavingSupport(false) }
  }

  useEffect(() => {
    // load globals initially
    fetchGlobalActivities(); fetchGlobalIdeas(); fetchSupport(); fetchSlides()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${baseUrl}/api/admin/super-admins/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Email': currentAdmin?.email || '',
          'X-Admin-Group': currentAdmin?.adminGroup || ''
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (data.success) {
        setShowModal(false)
        setFormData({ email: '', username: '', contactNumber: '', adminGroup: 'choir', role: 'admin' })
        fetchAdmins()
        
        if (data.emailSent) {
          alert('Admin created successfully! An invitation email with password setup instructions has been sent to ' + formData.email)
        } else {
          const message = 'Admin created successfully! However, the email could not be sent.\n\n' +
            'Password setup link:\n' + (data.passwordSetupLink || 'N/A') +
            '\n\nPlease send this link to the admin manually.'
          alert(message)
        }
      } else {
        alert(data.message || 'Failed to create admin')
      }
    } catch (error) {
      console.error('Failed to create admin:', error)
      alert('Failed to create admin')
    }
  }

  const handleSuspend = async (admin: Admin) => {
    if (!confirm(`Are you sure you want to suspend ${admin.username}?`)) return

    try {
      const response = await fetch(`${baseUrl}/api/admin/super-admins/${admin._id}/suspend?adminGroup=${admin.adminGroup}`, {
        method: 'PUT',
        headers: {
          'X-Admin-Email': currentAdmin?.email || '',
          'X-Admin-Group': currentAdmin?.adminGroup || ''
        }
      })

      const data = await response.json()
      if (data.success) {
        fetchAdmins()
        alert('Admin suspended successfully!')
      } else {
        alert(data.message || 'Failed to suspend admin')
      }
    } catch (error) {
      console.error('Failed to suspend admin:', error)
      alert('Failed to suspend admin')
    }
  }

  const handleApprove = async (admin: Admin) => {
    if (!confirm(`Are you sure you want to approve ${admin.username}?`)) return

    try {
      const response = await fetch(`${baseUrl}/api/admin/super-admins/${admin._id}/approve?adminGroup=${admin.adminGroup}`, {
        method: 'PUT',
        headers: {
          'X-Admin-Email': currentAdmin?.email || '',
          'X-Admin-Group': currentAdmin?.adminGroup || ''
        }
      })

      const data = await response.json()
      if (data.success) {
        fetchAdmins()
        alert('Admin approved successfully!')
      } else {
        alert(data.message || 'Failed to approve admin')
      }
    } catch (error) {
      console.error('Failed to approve admin:', error)
      alert('Failed to approve admin')
    }
  }

  const handleDelete = async (admin: Admin) => {
    if (!confirm(`Are you sure you want to delete ${admin.username}? This action cannot be undone.`)) return

    try {
      const response = await fetch(`${baseUrl}/api/admin/super-admins/${admin._id}?adminGroup=${admin.adminGroup}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Email': currentAdmin?.email || '',
          'X-Admin-Group': currentAdmin?.adminGroup || ''
        }
      })

      const data = await response.json()
      if (data.success) {
        fetchAdmins()
        alert('Admin deleted successfully!')
      } else {
        alert(data.message || 'Failed to delete admin')
      }
    } catch (error) {
      console.error('Failed to delete admin:', error)
      alert('Failed to delete admin')
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super-admin': return 'bg-purple-100 text-purple-800'
      case 'admin': return 'bg-blue-100 text-blue-800'
      case 'editor': return 'bg-green-100 text-green-800'
      case 'viewer': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }


  function renderSlidesTab() {
    return (
      <div>
        <p className="text-sm text-gray-600 mb-3">Homepage slider images. Add images to rotate on the home page banner; inactive slides are hidden.</p>
        <form onSubmit={createSlide} className="grid md:grid-cols-2 gap-3 mb-4">
          <div className="flex gap-2">
            <input type="file" accept="image/*" onChange={(e)=>{ const f=e.target.files?.[0]; if(f) uploadSlideImage(f) }} className="border rounded p-2 text-sm w-full" disabled={slideImgUploading} />
            {slideImgUploading && <span className="text-xs text-gray-500 self-center">Uploading...</span>}
          </div>
          <input placeholder="Image URL (or paste link)" className="border rounded p-2" value={slideForm.imageUrl} onChange={(e)=>setSlideForm({...slideForm,imageUrl:e.target.value})} required />
          <input placeholder="Caption (optional)" className="border rounded p-2 md:col-span-2" value={slideForm.caption} onChange={(e)=>setSlideForm({...slideForm,caption:e.target.value})} />
          <div className="md:col-span-2 flex justify-end"><button disabled={savingSlide || !slideForm.imageUrl.trim()} className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50">{savingSlide?'Adding...':'Add Slide'}</button></div>
        </form>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {slides.map((sl:any)=> (
            <div key={sl._id} className="border rounded-lg overflow-hidden">
              <img src={sl.imageUrl} alt={sl.caption || 'Slide'} className="w-full h-24 object-cover bg-gray-100" />
              <div className="p-2 text-xs">
                {sl.caption && <div className="truncate text-gray-600 mb-1">{sl.caption}</div>}
                <div className="flex items-center justify-between">
                  <button onClick={()=>toggleSlide(sl._id, !!sl.isActive)} className={sl.isActive?'text-green-600':'text-gray-400'}>{sl.isActive?'Active':'Hidden'}</button>
                  <button onClick={()=>deleteSlide(sl._id)} className="text-red-600">Delete</button>
                </div>
              </div>
            </div>
          ))}
          {slides.length===0 && <div className="text-gray-500 text-sm col-span-full">No slides yet. The homepage shows the default banner until you add images.</div>}
        </div>
      </div>
    )
  }

  const filteredAdmins = admins.filter(admin => {
    if (filterGroup !== 'all' && admin.adminGroup !== filterGroup) return false
    if (filterStatus === 'approved' && !admin.isApproved) return false
    if (filterStatus === 'suspended' && admin.isApproved) return false
    return true
  })

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Super Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage administrators and homepage content across all CEP family groups</p>
      </div>

      {/* Main Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setMainTab('admins')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              mainTab === 'admins'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <i data-lucide="users" className="w-4 h-4 inline mr-2"></i>
            Manage Admins
          </button>
          <button
            onClick={() => { setMainTab('homepage'); setActiveGlobalTab('activities') }}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              mainTab === 'homepage'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <i data-lucide="globe" className="w-4 h-4 inline mr-2"></i>
            Homepage Management
          </button>
          <button
            onClick={() => setMainTab('slides')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              mainTab === 'slides'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <i data-lucide="image" className="w-4 h-4 inline mr-2"></i>
            Homepage Slider
          </button>
        </nav>
      </div>

      {/* Homepage Slider Section */}
      {mainTab === 'slides' && (
        <div className="bg-white rounded-lg shadow p-4">
          {renderSlidesTab()}
        </div>
      )}

      {/* Admin Management Section */}
      {mainTab === 'admins' && (
        <>
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-4">
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <i data-lucide="plus" className="w-4 h-4 mr-2"></i> Create New Admin
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Group</label>
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Groups</option>
                {ALL_GROUPS.map(group => (
                  <option key={group.value} value={group.value}>{group.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Admins Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAdmins.map(admin => (
                  <tr key={admin._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {admin.profileImage ? (
                          <img className="h-10 w-10 rounded-full mr-3" src={admin.profileImage} alt={admin.username} />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold mr-3">
                            {admin.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{admin.username}</div>
                          <div className="text-sm text-gray-500">{admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {ALL_GROUPS.find(g => g.value === admin.adminGroup)?.label || admin.adminGroup}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(admin.role)}`}>
                        {ROLES.find(r => r.value === admin.role)?.label || admin.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {admin.isApproved ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Approved</span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Suspended</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap gap-2">
                        {admin.email === currentAdmin?.email ? (
                          <span className="text-gray-400 text-xs">Current User</span>
                        ) : (
                          <>
                            {admin.isApproved ? (
                              <button
                                onClick={() => handleSuspend(admin)}
                                className="px-3 py-1 rounded bg-orange-500 hover:bg-orange-600 text-white text-xs"
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                onClick={() => handleApprove(admin)}
                                className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs"
                              >
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(admin)}
                              className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          {filteredAdmins.length === 0 && (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              No admins found.
            </div>
          )}
        </>
      )}

      {/* Global Home Pages Management */}
      {mainTab === 'homepage' && (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2 mb-4">
          {(['activities','ideas','support','slides','cepier-members'] as const).map(tab => (
            <button key={tab} onClick={()=>setActiveGlobalTab(tab)} className={`px-3 py-2 rounded ${activeGlobalTab===tab?'bg-blue-600 text-white':'bg-gray-100 text-gray-800'}`}>{tab === 'cepier-members' ? 'CEP Members' : tab[0].toUpperCase()+tab.slice(1)}</button>
          ))}
        </div>
        {activeGlobalTab==='activities' && (
          <div>
            <form onSubmit={createGlobalActivity} className="grid md:grid-cols-2 gap-3 mb-4">
              <input placeholder="Title" className="border rounded p-2" value={activityForm.title} onChange={(e)=>setActivityForm({...activityForm,title:e.target.value})} required />
              <div className="flex gap-2">
                <input type="file" accept="image/*" onChange={(e)=>{ const f=e.target.files?.[0]; if(f) uploadActivityImage(f) }} className="border rounded p-2 text-sm w-full" disabled={activityImgUploading} />
                {activityImgUploading && <span className="text-xs text-gray-500 self-center">Uploading...</span>}
              </div>
              <input placeholder="Image URL (or paste link)" className="border rounded p-2" value={activityForm.imageUrl} onChange={(e)=>setActivityForm({...activityForm,imageUrl:e.target.value})} />
              <input placeholder="Date (YYYY-MM-DD)" className="border rounded p-2" value={activityForm.eventDate} onChange={(e)=>setActivityForm({...activityForm,eventDate:e.target.value})} />
              <input placeholder="Time (eg. 10:00)" className="border rounded p-2" value={activityForm.eventTime} onChange={(e)=>setActivityForm({...activityForm,eventTime:e.target.value})} />
              <input placeholder="Location" className="border rounded p-2" value={activityForm.location} onChange={(e)=>setActivityForm({...activityForm,location:e.target.value})} />
              <input placeholder="Description" className="border rounded p-2 md:col-span-2" value={activityForm.description} onChange={(e)=>setActivityForm({...activityForm,description:e.target.value})} />
              <div className="md:col-span-2 flex justify-end"><button disabled={savingActivity} className="bg-blue-600 text-white rounded px-4 py-2">{savingActivity?'Saving...':'Add Activity'}</button></div>
            </form>
            <div className="divide-y">
              {globalActivities.map((ev:any)=> (
                <div key={ev._id} className="py-3 flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{ev.title}</div>
                    <div className="text-sm text-gray-600">{ev.location} {ev.date? '• '+ new Date(ev.date).toLocaleDateString(): ''}</div>
                    {ev.description && <div className="text-sm">{ev.description}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>deleteGlobalActivity(ev._id)} className="text-red-600">Delete</button>
                  </div>
                </div>
              ))}
              {globalActivities.length===0 && <div className="text-gray-500 text-sm">No activities yet.</div>}
            </div>
          </div>
        )}
        {activeGlobalTab==='ideas' && (
          <div>
            <div className="text-sm text-gray-600 mb-2">Public submissions appear on homepage; you can mark as implemented or delete.</div>
            <div className="divide-y">
              {globalIdeas.map((it:any)=> (
                <div key={it._id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{it.idea}</div>
                    <div className="text-sm text-gray-600">{it.anonymous? 'Anonymous' : (it.name || 'Member')} {it.implementedDate? '• Implemented '+ new Date(it.implementedDate).toLocaleDateString(): ''}</div>
                  </div>
                  <div className="flex gap-2">
                    {!it.implementedDate && <button onClick={()=>implementGlobalIdea(it._id)} className="text-green-600">Mark Implemented</button>}
                    <button onClick={()=>deleteGlobalIdea(it._id)} className="text-red-600">Delete</button>
                  </div>
                </div>
              ))}
              {globalIdeas.length===0 && <div className="text-gray-500 text-sm">No ideas yet.</div>}
            </div>
          </div>
        )}
        {activeGlobalTab==='support' && (
          <form onSubmit={saveSupport} className="grid md:grid-cols-2 gap-3">
            <input className="border rounded p-2 md:col-span-2" placeholder="Support page title" value={supportDoc?.title||''} onChange={(e)=>setSupportDoc((d:any)=>({...d, title:e.target.value}))} />
            <input className="border rounded p-2" placeholder="Bank Name" value={supportDoc?.bank?.bankName||''} onChange={(e)=>setSupportDoc((d:any)=>({...d, bank:{...d?.bank, bankName:e.target.value}}))} />
            <input className="border rounded p-2" placeholder="Account Name" value={supportDoc?.bank?.accountName||''} onChange={(e)=>setSupportDoc((d:any)=>({...d, bank:{...d?.bank, accountName:e.target.value}}))} />
            <input className="border rounded p-2" placeholder="Account Number" value={supportDoc?.bank?.accountNumber||''} onChange={(e)=>setSupportDoc((d:any)=>({...d, bank:{...d?.bank, accountNumber:e.target.value}}))} />
            <input className="border rounded p-2" placeholder="Swift Code" value={supportDoc?.bank?.swiftCode||''} onChange={(e)=>setSupportDoc((d:any)=>({...d, bank:{...d?.bank, swiftCode:e.target.value}}))} />
            <input className="border rounded p-2" placeholder="MTN" value={supportDoc?.mobileMoney?.mtn||''} onChange={(e)=>setSupportDoc((d:any)=>({...d, mobileMoney:{...d?.mobileMoney, mtn:e.target.value}}))} />
            <input className="border rounded p-2" placeholder="Airtel" value={supportDoc?.mobileMoney?.airtel||''} onChange={(e)=>setSupportDoc((d:any)=>({...d, mobileMoney:{...d?.mobileMoney, airtel:e.target.value}}))} />
            <textarea className="border rounded p-2 md:col-span-2" placeholder="Online Donation Note" value={supportDoc?.onlineDonationNote||''} onChange={(e)=>setSupportDoc((d:any)=>({...d, onlineDonationNote:e.target.value}))} />
            <div className="md:col-span-2 flex justify-end"><button disabled={savingSupport} className="bg-blue-600 text-white rounded px-4 py-2">{savingSupport?'Saving...':'Save Support'}</button></div>
          </form>
        )}
        {activeGlobalTab==='slides' && renderSlidesTab()}
        {activeGlobalTab==='cepier-members' && (
          <CEPAllMembers baseUrl={baseUrl} currentAdmin={currentAdmin} />
        )}
      </div>
      )}

      {/* Create Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Create New Admin</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i data-lucide="x" className="w-6 h-6"></i>
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username / Full name *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact / Phone number</label>
                <input
                  type="tel"
                  inputMode="tel"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                  placeholder="07..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">At least 9 digits. Used for WhatsApp group access.</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <i data-lucide="mail" className="w-4 h-4 inline mr-2"></i>
                  <strong>Note:</strong> An invitation email will be sent to the admin's email address with instructions to set their password.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Group *</label>
                <select
                  value={formData.adminGroup}
                  onChange={(e) => setFormData({...formData, adminGroup: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {ALL_GROUPS.map(group => (
                    <option key={group.value} value={group.value}>{group.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {ROLES.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const GROUP_LABELS: Record<string, string> = {
  cepier: 'CEP',
  choir: 'Choir',
  anointed: 'Anointed',
  abanyamugisha: 'Abanyamugisha',

  psalm23: 'Psalm 23',
  psalm46: 'Psalm 46',
  protocol: 'Protocol',
  social: 'Social',
  evangelical: 'Evangelical',
}

function CEPAllMembers({ baseUrl, currentAdmin }: { baseUrl: string; currentAdmin: any }) {
  const [members, setMembers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState<boolean>(false)
  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`${baseUrl}/api/admin/super-admin/members`, { headers: { 'X-Admin-Email': currentAdmin?.email || '' } })
      const data = await res.json(); if (data.success) setMembers(data.members || [])
    } catch {}
    setLoading(false)
  }
  React.useEffect(() => { load() }, [])
  function groupLabel(g: string) {
    return GROUP_LABELS[g] || g
  }
  function downloadCSV() {
    const escape = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const header = ['Name', 'Email', 'Contact Number', 'Group', 'Role', 'Status', 'Registered']
    const rows = members.map((m: any) => [
      m.username || '',
      m.email || '',
      m.contactNumber || '',
      groupLabel(m.userGroup || ''),
      m.role || '',
      m.isApproved ? 'Approved' : 'Pending',
      m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '',
    ])
    const csv = [header, ...rows].map((r) => r.map(escape).join(',')).join('\r\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cep-all-members.csv'
    a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold">CEP Members</h3>
          <p className="text-sm text-gray-500">All registered users across every CEP family group.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadCSV} className="text-sm bg-green-600 text-white px-3 py-1 rounded flex items-center">
            <i data-lucide="download" className="w-4 h-4 mr-1"></i> Download CSV
          </button>
          <button onClick={load} className="text-sm bg-gray-100 px-3 py-1 rounded">Refresh</button>
        </div>
      </div>
      {loading ? <div className="text-sm text-gray-500">Loading...</div> : (
        <div className="divide-y max-h-[32rem] overflow-y-auto">
          {members.map((m:any)=> (
            <div key={m._id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{m.username || m.email}</div>
                <div className="text-sm text-gray-600">{m.email} {m.contactNumber ? `• ${m.contactNumber}` : ''}</div>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{groupLabel(m.userGroup || '')}</span>
                {m.isApproved ? (
                  <span className="text-green-700 text-xs bg-green-100 px-2 py-1 rounded">Approved</span>
                ) : (
                  <span className="text-yellow-700 text-xs bg-yellow-100 px-2 py-1 rounded">Pending</span>
                )}
              </div>
            </div>
          ))}
          {members.length===0 && <div className="text-sm text-gray-500">No members yet.</div>}
        </div>
      )}
    </div>
  )
}

