import React, { useEffect, useState } from 'react'

export default function IdeasPage() {
  const baseUrl = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:4000'
  const [ideas, setIdeas] = useState<any[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetch(`${baseUrl}/api/home/ideas`).then(r=>r.json()).then(r=>setIdeas(r.data||[])).catch(()=>setIdeas([]))
  }, [baseUrl])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formEl = e.currentTarget
    const form = new FormData(formEl)
    const payload = {
      idea: String(form.get('idea') || ''),
      name: String(form.get('name') || ''),
      email: String(form.get('email') || ''),
      category: String(form.get('category') || 'other'),
      anonymous: Boolean(form.get('anonymous')),
    }
    if (!payload.idea) return
    setBusy(true)
    try {
      const res = await fetch(`${baseUrl}/api/home/ideas`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to submit idea')
      formEl.reset()
      alert('Thank you! Your idea was submitted for review.')
    } catch (err: any) {
      alert(err?.message || 'Failed to submit idea')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Share Your Ideas</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Your Name (Optional)</label>
              <input name="name" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Email (Optional)</label>
              <input name="email" type="email" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="your.email@example.com" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
              <select name="category" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="song">Song/Music</option>
                <option value="performance">Performance</option>
                <option value="event">Event</option>
                <option value="improvement">Improvement</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Your Idea *</label>
              <textarea name="idea" rows={5} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Describe your idea in detail..." />
            </div>
            <div className="flex items-center">
              <input type="checkbox" name="anonymous" id="anonymous" className="mr-2" />
              <label htmlFor="anonymous" className="text-gray-700 text-sm">Submit anonymously</label>
            </div>
            <button type="submit" disabled={busy} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out shadow-lg">
              {busy ? 'Submitting...' : 'Submit Idea'}
            </button>
          </form>
        </div>
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-blue-800 mb-4">Recent Implemented Ideas</h3>
          <div className="space-y-4">
            {ideas.length === 0 ? <p className="text-gray-600">No implemented ideas yet.</p> : ideas.map((it: any) => (
              <div key={it._id} className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-gray-800 font-medium">"{it.idea}"</p>
                <p className="text-sm text-gray-600 mt-1">Suggested by {it.anonymous ? 'Anonymous' : (it.name || 'a member')} {it.implementedDate ? ` • Implemented ${new Date(it.implementedDate).toLocaleDateString()}` : ''}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
