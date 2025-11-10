import React, { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function CepRegisterPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const [form, setForm] = useState<{ email: string; username: string; profileImage: File | null }>({ email: '', username: '', profileImage: null })
  const initialFamily = useMemo(() => {
    try {
      const p = location.pathname.toLowerCase()
      const params = new URLSearchParams(location.search)
      const f = (params.get('family') || '').toLowerCase()
      const list = ['cepier','choir','anointed','abanyamugisha','psalm23','psalm46','protocol','social','evangelical']
      if (list.includes(f)) return f
      for (const key of list) { if (p.includes(`/${key}/`)) return key }
    } catch {}
    return 'cepier'
  }, [location.pathname, location.search])
  const [family, setFamily] = useState<string>(initialFamily)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success'|'error'; text: string }|null>(null)
  const [preview, setPreview] = useState<string|null>(null)

  const baseUrl = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:4000'

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null
    setForm((p) => ({ ...p, profileImage: f }))
    if (f) {
      const r = new FileReader()
      r.onload = (ev) => setPreview(ev.target?.result as string)
      r.readAsDataURL(f)
    } else {
      setPreview(null)
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    try {
      const fd = new FormData()
      fd.append('email', form.email)
      fd.append('username', form.username)
      if (form.profileImage) fd.append('profileImage', form.profileImage)
      fd.append('userGroup', family)
      // brand email as CEPier when choosing CEPier (general = choir group)
      if (family === 'choir') fd.append('displayAs', 'cepier')
      const res = await fetch(`${baseUrl}/api/auth/register`, { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Registration failed')
      setMsg({ type: 'success', text: data.emailSent ? 'Registration successful! Check your email.' : `Registration successful! Use this link to set your password: ${data.verificationLink}` })
      setForm({ email: '', username: '', profileImage: null })
      setPreview(null)
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message || 'Registration failed' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
      <header className="bg-blue-700 text-white shadow-lg p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-white p-2 hover:bg-blue-600 rounded-lg transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl md:text-3xl font-extrabold tracking-tight">CEPier Registration</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="/" className="px-3 py-2 rounded-lg hover:bg-blue-600">Home</a>
            <a href="/families" className="px-3 py-2 rounded-lg hover:bg-blue-600">Our Families</a>
          </nav>
        </div>
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-blue-800 border-t border-blue-600">
            <nav className="container mx-auto py-4 space-y-2">
              <a 
                href="/" 
                className="block px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </a>
              <a 
                href="/families" 
                className="block px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Our Families
              </a>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-md mx-auto w-full bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Create your account</h2>
          <form className="space-y-4" onSubmit={submit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (Gmail)</label>
              <input type="email" required value={form.email} onChange={(e)=>setForm((p)=>({...p, email: e.target.value}))} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="yourname@gmail.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username (optional)</label>
              <input type="text" value={form.username} onChange={(e)=>setForm((p)=>({...p, username: e.target.value}))} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="your username" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image (optional)</label>
              <input type="file" accept="image/*" onChange={onFile} className="w-full px-4 py-2 border rounded-lg" />
              {preview && <img src={preview} alt="preview" className="mt-2 w-16 h-16 rounded-full object-cover" />}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select your family</label>
              <select value={family} onChange={(e)=>setFamily(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="cepier">CEPier (General)</option>
                <option disabled>──────────</option>
                <option value="choir">Ishyanga Ryera Choir</option>
                <option value="anointed">Anointed Worship Team</option>
                <option value="abanyamugisha">Abanyamugisha Family</option>
                <option value="psalm23">Psalm 23 Family</option>
                <option value="psalm46">Psalm 46 Family</option>
                <option value="protocol">Protocol Family</option>
                <option value="social">Social Family</option>
                <option value="evangelical">Evangelical Family</option>
              </select>
            </div>
            {msg && (
              <div className={`p-3 rounded ${msg.type==='success'?'bg-green-50 text-green-700 border border-green-200':'bg-red-50 text-red-700 border border-red-200'}`}>{msg.text}</div>
            )}
            <button type="submit" disabled={busy} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2 px-4 rounded-lg">
              {busy ? 'Registering...' : 'Register'}
            </button>
          </form>
          <div className="text-sm text-gray-600 mt-4">Already have an account? <a href="/chat" className="text-blue-700">Go to Chat</a></div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white p-4 text-center mt-8">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} CEP Huye College. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
