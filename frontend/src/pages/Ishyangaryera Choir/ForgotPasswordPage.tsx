import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getApiBaseUrl } from '../../utils/api'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'verify' | 'reset'>('email')
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const baseUrl = getApiBaseUrl()

  // Determine group and redirect path based on URL
  const getGroupInfo = () => {
    const path = location.pathname.toLowerCase()
    if (path.includes('/cepier/forgot-password')) {
      return { group: 'CEPier', redirectPath: '/cepier/members' }
    } else if (path.includes('/anointed/forgot-password')) {
      return { group: 'Anointed Worship Team', redirectPath: '/anointed' }
    } else if (path.includes('/abanyamugisha/forgot-password')) {
      return { group: 'Abanyamugisha Family', redirectPath: '/abanyamugisha' }
    } else if (path.includes('/psalm23/forgot-password')) {
      return { group: 'Psalm 23 Family', redirectPath: '/psalm23' }
    } else if (path.includes('/psalm46/forgot-password')) {
      return { group: 'Psalm 46 Family', redirectPath: '/psalm46' }
    } else if (path.includes('/protocol/forgot-password')) {
      return { group: 'Protocol Family', redirectPath: '/protocol' }
    } else if (path.includes('/social/forgot-password')) {
      return { group: 'Social Family', redirectPath: '/social' }
    } else if (path.includes('/evangelical/forgot-password')) {
      return { group: 'Evangelical Family', redirectPath: '/evangelical' }
    } else {
      return { group: 'Ishyanga Ryera Choir', redirectPath: '/choir' }
    }
  }

  const { group, redirectPath } = getGroupInfo()

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${baseUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Verification code sent to your email!')
        setStep('verify')
      } else {
        setError(data.message || 'Failed to send verification code')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${baseUrl}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Code verified! Please set your new password.')
        setStep('reset')
      } else {
        setError(data.message || 'Invalid verification code')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${baseUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          verificationCode, 
          newPassword 
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Password reset successfully! Redirecting to login...')
        setTimeout(() => {
          navigate(redirectPath)
        }, 2000)
      } else {
        setError(data.message || 'Failed to reset password')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Forgot Password?</h2>
            <p className="text-sm text-gray-500 mb-2">{group}</p>
            <p className="text-gray-600 mt-2">
              {step === 'email' && 'Enter your email to receive a verification code'}
              {step === 'verify' && 'Check your email and enter the verification code'}
              {step === 'reset' && 'Enter your new password'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate(redirectPath)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                  placeholder="000000"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Check your email for the 6-digit code
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <div className="text-center space-x-4">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Resend Code
                </button>
                <span className="text-gray-400">|</span>
                <button
                  type="button"
                  onClick={() => navigate(redirectPath)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate(redirectPath)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Remember your password?{' '}
            <button
              onClick={() => navigate(redirectPath)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

