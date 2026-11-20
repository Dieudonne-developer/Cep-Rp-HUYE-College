import React, { useEffect, useState } from 'react'
import { useLucideIcons } from '../../../utils/lucideIcons'
import { getApiBaseUrl } from '../../../utils/api'

type SupportItem = {
  id: string
  title: string
  description: string
  kind: 'bank' | 'mobile' | 'link' | 'help' | 'other'
  details: string
  url: string
  isActive: boolean
  sortOrder: number
}

const KIND_LABELS: Record<string, string> = {
  bank: 'Bank Transfer',
  mobile: 'Mobile Money',
  link: 'Link / Website',
  help: 'Help / Info',
  other: 'Other',
}

const EMPTY_FORM = { title: '', description: '', kind: 'other' as SupportItem['kind'], details: '', url: '', sortOrder: 0, isActive: true }

export default function AdminSupport() {
  const baseUrl = getApiBaseUrl()
  const adminGroup = (() => {
    try {
      const raw = localStorage.getItem('admin')
      if (!raw) return 'choir'
      const obj = JSON.parse(raw)
      return obj?.adminGroup || 'choir'
    } catch { return 'choir' }
  })()
  const isGlobal = adminGroup === 'cepier'
  const groupQuery = isGlobal ? 'group=global' : `group=${adminGroup}`

  const [items, setItems] = useState<SupportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<SupportItem | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => { fetchItems() }, [])
  useLucideIcons()

  async function fetchItems() {
    try {
      setLoading(true)
      const adminRaw = localStorage.getItem('admin')
      const admin = adminRaw ? JSON.parse(adminRaw) : {}
      const res = await fetch(`${baseUrl}/api/admin/support-items?${groupQuery}`, {
        headers: { 'X-Admin-Group': adminGroup, 'X-Admin-Email': admin?.email || '' }
      })
      const data = await res.json()
      if (data.success) setItems(data.items || [])
      else setMessage({ type: 'error', text: data.message || 'Failed to load support items' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to load support items' })
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setEditing(null)
    setForm({ ...EMPTY_FORM })
    setMessage(null)
    setShowModal(true)
  }

  function openEdit(item: SupportItem) {
    setEditing(item)
    setForm({
      title: item.title,
      description: item.description || '',
      kind: item.kind || 'other',
      details: item.details || '',
      url: item.url || '',
      sortOrder: item.sortOrder || 0,
      isActive: item.isActive !== false,
    })
    setMessage(null)
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const adminRaw = localStorage.getItem('admin')
      const admin = adminRaw ? JSON.parse(adminRaw) : {}
      const url = editing
        ? `${baseUrl}/api/admin/support-items/${editing.id}?${groupQuery}`
        : `${baseUrl}/api/admin/support-items?${groupQuery}`
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Group': adminGroup, 'X-Admin-Email': admin?.email || '' },
        body: JSON.stringify(form)
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        setMessage({ type: 'error', text: data.message || 'Failed to save support item' })
        return
      }
      setShowModal(false)
      fetchItems()
    } catch {
      setMessage({ type: 'error', text: 'Failed to save support item' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: SupportItem) {
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return
    try {
      const adminRaw = localStorage.getItem('admin')
      const admin = adminRaw ? JSON.parse(adminRaw) : {}
      const res = await fetch(`${baseUrl}/api/admin/support-items/${item.id}?${groupQuery}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Group': adminGroup, 'X-Admin-Email': admin?.email || '' }
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        alert(data.message || 'Failed to delete support item')
        return
      }
      fetchItems()
    } catch {
      alert('Failed to delete support item')
    }
  }

  async function toggleActive(item: SupportItem) {
    try {
      const adminRaw = localStorage.getItem('admin')
      const admin = adminRaw ? JSON.parse(adminRaw) : {}
      await fetch(`${baseUrl}/api/admin/support-items/${item.id}?${groupQuery}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Group': adminGroup, 'X-Admin-Email': admin?.email || '' },
        body: JSON.stringify({ isActive: !item.isActive })
      })
      fetchItems()
    } catch {
      alert('Failed to update support item')
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Support</h1>
          <p className="text-sm text-gray-600">
            Publish support options (bank accounts, mobile money, links, help info). Members see them on the public support page and choose what they want.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <i data-lucide="plus" className="w-4 h-4 mr-2"></i> Publish Support Option
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-6 text-gray-500">Loading support options...</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No support options published yet. Click "Publish Support Option" to add one.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className={`bg-white rounded-lg border p-5 shadow-sm ${item.isActive ? 'border-gray-200' : 'border-gray-200 opacity-60'}`}>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{KIND_LABELS[item.kind] || item.kind}</span>
                    {!item.isActive && <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-200 text-gray-600">Hidden</span>}
                  </div>
                  {item.description && <p className="text-sm text-gray-600 mb-1">{item.description}</p>}
                  {item.details && <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.details}</p>}
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">{item.url}</a>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleActive(item)}
                    className={`px-3 py-1 rounded text-xs ${item.isActive ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                  >
                    {item.isActive ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={() => openEdit(item)}
                    className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center"
                  >
                    <i data-lucide="edit" className="w-3 h-3 mr-1"></i> Update
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs flex items-center"
                  >
                    <i data-lucide="trash-2" className="w-3 h-3 mr-1"></i> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg space-y-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">{editing ? 'Update Support Option' : 'Publish Support Option'}</h2>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <i data-lucide="x" className="w-6 h-6"></i>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Bank Transfer, Momo Help Line, Scholarship Fund"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value as SupportItem['kind'] })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {Object.entries(KIND_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder="Explain what this support option is for (e.g., helps people in need, pays for events...)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Details (account number, phone, instructions...)</label>
              <textarea
                value={form.details}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
                rows={3}
                placeholder="e.g., Bank: Bank of Kigali — Account: 00040-... — Name: CEP Huye"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link (optional)</label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort order</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value, 10) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  Visible to members
                </label>
              </div>
            </div>

            {message && (
              <div className={`text-sm px-3 py-2 rounded border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                {message.text}
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2 border-t border-gray-200">
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50">
                {saving ? 'Saving...' : editing ? 'Update' : 'Publish'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
