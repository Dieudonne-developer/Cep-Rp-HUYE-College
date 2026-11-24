import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiBaseUrl } from '../utils/api'
import { initializeLucideIcons } from '../utils/lucideIcons'

export default function TestLoginPage() {
  const [email, setEmail] = useState('superadmin@cep.com')
  const [password, setPassword] = useState('SuperAdmin@2024')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  // Initialize Lucide icons when component mounts
  useEffect(() => {
    initializeLucideIcons()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const apiUrl = getApiBaseUrl()
      const response = await fetch(`${apiUrl}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || !data.success) {
        setError(data.message || `Login failed (${response.status})`)
        return
      }

      if (data.success) {
        localStorage.setItem('admin', JSON.stringify(data.admin))
        setSuccess('Login successful! Redirecting to dashboard...')
        setTimeout(() => {
          // Redirect super admin to super admin dashboard
          if (data.admin?.role === 'super-admin') {
            navigate('/admin/super-admins')
          } else {
          navigate('/admin/dashboard')
          }
        }, 1500)
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (err) {
      console.error('Login error:', err)
      const errorMessage = err instanceof Error 
        ? `Network error: ${err.message}. Please check if the backend server is running at ${getApiBaseUrl()}`
        : 'Network error. Please check if the backend server is running.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center text-white">
          <div className="bg-white bg-opacity-20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
            <img src={`${getApiBaseUrl()}/api/assets/logo`} alt="CEP RP Huye Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold mb-2">CEP RP Huye</h1>
          <p className="text-blue-100">Administration Portal</p>
        </div>

        {/* Login Form */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Admin Login</h2>
          <p className="text-sm text-gray-600 text-center mb-6">
            Login for all CEP administrators (Choir, Anointed, Abanyamugisha, Psalm23, Psalm46, Protocol, Social, Evangelical, CEP)
          </p>

          {/* Success Message */}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center">
              <i data-lucide="check-circle" className="w-5 h-5 mr-2"></i>
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
              <i data-lucide="alert-circle" className="w-5 h-5 mr-2"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i data-lucide="mail" className="w-5 h-5 text-gray-400"></i>
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                         placeholder="superadmin@cep.com or admin@cep.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i data-lucide="lock" className="w-5 h-5 text-gray-400"></i>
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <i data-lucide="log-in" className="w-5 h-5 mr-2"></i>
                  Sign In to Admin Panel
                </>
              )}
            </button>
          </form>

        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 text-center">
          <p className="text-xs text-gray-500">
            CEP RP Huye Administration Portal
          </p>
          <p className="text-xs text-gray-400 mt-1">
            For all family administrators • Version 1.0.0
          </p>
        </div>
      </div>
    </div>
  )
}






