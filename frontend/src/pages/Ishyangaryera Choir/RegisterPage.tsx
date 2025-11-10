import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Users, Music, Menu, Info, Calendar, Lightbulb, HeartHandshake, MessageCircle } from 'lucide-react'

export default function RegisterPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    profileImage: null as File | null
  })
  const initialFamily = (() => {
    const p = location.pathname.toLowerCase()
    if (p.includes('/anointed/')) return 'anointed'
    if (p.includes('/abanyamugisha/')) return 'abanyamugisha'
    if (p.includes('/psalm23/')) return 'psalm23'
    if (p.includes('/psalm46/')) return 'psalm46'
    if (p.includes('/protocol/')) return 'protocol'
    if (p.includes('/social/')) return 'social'
    if (p.includes('/evangelical/')) return 'evangelical'
    // Support query param ?family=
    try {
      const params = new URLSearchParams(location.search)
      const f = (params.get('family') || '').toLowerCase()
      if (['cepier','choir','anointed','abanyamugisha','psalm23','psalm46','protocol','social','evangelical'].includes(f)) return f
    } catch {}
    return 'choir'
  })()
  const [selectedFamily, setSelectedFamily] = useState<string>(initialFamily)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // Determine userGroup from URL
  const userGroup = initialFamily;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        profileImage: file
      }))
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const validateEmail = (email: string) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/
    return gmailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    // Validate Gmail
    if (!validateEmail(formData.email)) {
      setMessage({type: 'error', text: 'Please enter a valid Gmail address'})
      setIsLoading(false)
      return
    }

    // Validate username (optional)
    if (formData.username && formData.username.length < 3) {
      setMessage({type: 'error', text: 'Username must be at least 3 characters long if provided'})
      setIsLoading(false)
      return
    }

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('email', formData.email)
      formDataToSend.append('username', formData.username)
      if (formData.profileImage) {
        formDataToSend.append('profileImage', formData.profileImage)
      }
      formDataToSend.append('userGroup', selectedFamily)

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        body: formDataToSend
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({type: 'success', text: 'Registration successful! Please check your Gmail for password setup instructions.'})
        setFormData({email: '', username: '', profileImage: null})
        setPreviewImage(null)
      } else {
        setMessage({type: 'error', text: data.message || 'Registration failed. Please try again.'})
      }
    } catch (error) {
      setMessage({type: 'error', text: 'Network error. Please check your connection and try again.'})
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
      {/* Header - Same as ChoirPage */}
      <header className="bg-blue-700 text-white shadow-lg p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-white p-2 hover:bg-blue-600 rounded-lg transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl md:text-3xl font-extrabold tracking-tight">CEP Huye College</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="/" className="flex items-center px-3 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-blue-600">
              <Home className="mr-2 w-5 h-5" /> Home
            </a>
            <a href="/families" className="flex items-center px-3 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-blue-600">
              <Users className="mr-2 w-5 h-5" /> Our Families
            </a>
            <div className="flex items-center px-3 py-2 rounded-lg transition duration-300 ease-in-out bg-blue-800">
              <Music className="mr-2 w-5 h-5" /> Ishyanga Ryera Choir
            </div>
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
              <div className="block px-4 py-2 rounded-lg bg-blue-900">
                Ishyanga Ryera Choir
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Sub-Navigation - Same as ChoirPage */}
      <nav className="bg-blue-800 text-white shadow-md py-2 sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center md:justify-start space-x-1 md:space-x-4">
            <a href="/choir" className="px-3 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-blue-700 flex items-center">
              <Info className="mr-2 w-4 h-4" /> About
            </a>
            <a href="/choir" className="px-3 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-blue-700 flex items-center">
              <Music className="mr-2 w-4 h-4" /> Media
            </a>
            <a href="/choir" className="px-3 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-blue-700 flex items-center">
              <Calendar className="mr-2 w-4 h-4" /> Activities
            </a>
            <a href="/choir" className="px-3 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-blue-700 flex items-center">
              <Lightbulb className="mr-2 w-4 h-4" /> Ideas
            </a>
            <a href="/choir" className="px-3 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-blue-700 flex items-center">
              <HeartHandshake className="mr-2 w-4 h-4" /> Support
            </a>
            <a href="/choir" className="px-3 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-blue-700 flex items-center">
              <MessageCircle className="mr-2 w-4 h-4" /> Chat
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Ishyanga Ryera Choir</h1>
            <p className="text-gray-600">Create your account to join the choir chat</p>
          </div>

          {/* Registration Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Gmail Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="yourname@gmail.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Only Gmail accounts are accepted</p>
              </div>

              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username (Optional)
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Choose a unique username (optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  minLength={3}
                />
                <p className="text-xs text-gray-500 mt-1">Leave blank to use your email as username</p>
              </div>

              {/* Profile Image Field */}
              <div>
                <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image (Optional)
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    id="profileImage"
                    name="profileImage"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  />
                  {previewImage && (
                    <div className="flex justify-center">
                      <img
                        src={previewImage}
                        alt="Profile preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Select Family/Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select your family</label>
                <select
                  value={selectedFamily}
                  onChange={(e) => setSelectedFamily(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                >
                  <option value="cepier">CEPier (General)</option>
                  <option disabled>──────────</option>
                  <option value="choir">Ishyanga Ryera Choir</option>
                  <option value="anointed">Anointed worship team</option>
                  <option value="abanyamugisha">Abanyamugisha family</option>
                  <option value="psalm23">Psalm 23 family</option>
                  <option value="psalm46">Psalm 46 family</option>
                  <option value="protocol">Protocol family</option>
                  <option value="social">Social family</option>
                  <option value="evangelical">Evangelical family</option>
                </select>
              </div>

              {/* Message Display */}
              {message && (
                <div className={`p-4 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message.text}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </div>
                ) : (
                  'Register Account'
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/choir" className="text-green-500 hover:text-green-600 font-medium">
                  Sign in to chat
                </Link>
              </p>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              By registering, you agree to join the Ishyanga Ryera Choir community
            </p>
          </div>
        </div>
      </main>

      {/* Footer - Same as ChoirPage */}
      <footer className="bg-gray-800 text-white p-4 text-center mt-8">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} CEP Huye College. All rights reserved.</p>
          <p className="text-sm mt-2">Ishyanga Ryera Choir - Ministering through music</p>
        </div>
      </footer>
    </div>
  )
}
