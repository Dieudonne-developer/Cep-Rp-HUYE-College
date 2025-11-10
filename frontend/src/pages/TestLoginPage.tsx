import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function TestLoginPage() {
  const [email, setEmail] = useState('admin@ishyangaryera.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('admin', JSON.stringify(data.admin))
        setSuccess('Login successful! Redirecting to dashboard...')
        setTimeout(() => {
          navigate('/admin/dashboard')
        }, 1500)
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (err) {
      setError('Network error. Please check if the backend server is running.')
    } finally {
      setLoading(false)
    }
  }

  const testCredentials = [
    { email: 'admin@ishyangaryera.com', password: 'admin123', role: 'Choir Admin' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center text-white">
          <div className="bg-white bg-opacity-20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i data-lucide="shield-check" className="w-10 h-10"></i>
          </div>
          <h1 className="text-2xl font-bold mb-2">Ishyanga Ryera</h1>
          <p className="text-blue-100">Choir Administration Portal</p>
        </div>

        {/* Login Form */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Admin Login</h2>

          {/* Test Credentials Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
              <i data-lucide="info" className="w-4 h-4 mr-2"></i>
              Test Credentials
            </h3>
            <div className="space-y-2">
              {testCredentials.map((cred, index) => (
                <div key={index} className="text-xs text-blue-700">
                  <div className="font-mono bg-blue-100 px-2 py-1 rounded">
                    <strong>Email:</strong> {cred.email}
                  </div>
                  <div className="font-mono bg-blue-100 px-2 py-1 rounded mt-1">
                    <strong>Password:</strong> {cred.password}
                  </div>
                  <div className="text-blue-600 mt-1">
                    <strong>Role:</strong> {cred.role}
                  </div>
                </div>
              ))}
            </div>
          </div>

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
                  placeholder="admin@ishyangaryera.com"
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

          {/* Quick Actions */}
          <div className="mt-8 space-y-3">
            <div className="text-center">
              <button
                onClick={() => {
                  setEmail('admin@ishyangaryera.com')
                  setPassword('admin123')
                }}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Fill Test Credentials
              </button>
            </div>
            
            <div className="text-center">
              <a 
                href="/choir" 
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center"
              >
                <i data-lucide="arrow-left" className="w-4 h-4 mr-1"></i>
                Back to Public Choir Site
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 text-center">
          <p className="text-xs text-gray-500">
            Ishyanga Ryera Choir Administration Portal
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Version 1.0.0 • Test Environment
          </p>
        </div>
      </div>
    </div>
  )
}






