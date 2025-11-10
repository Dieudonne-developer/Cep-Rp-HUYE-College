import React, { useEffect, useState } from 'react'

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

export default function SupportPage() {
  const [supportData, setSupportData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSupportData()
  }, [])

  const fetchSupportData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${baseUrl}/api/home/support`)
      const data = await response.json()
      
      if (data.success && data.support) {
        setSupportData(data.support)
      } else {
        setError('Failed to load support information')
      }
    } catch (err) {
      console.error('Error fetching support data:', err)
      setError('Failed to load support information. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-gray-600">Loading support information...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={fetchSupportData}
            className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const bank = supportData?.bank || {}
  const mobileMoney = supportData?.mobileMoney || {}
  const onlineDonationNote = supportData?.onlineDonationNote || 'Paystack verification pending server integration.'

  // Check if we have any bank information
  const hasBankInfo = bank.bankName || bank.accountName || bank.accountNumber || bank.swiftCode
  // Check if we have any mobile money information
  const hasMobileMoneyInfo = mobileMoney.mtn || mobileMoney.airtel

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Support CEP</h2>
      <p className="text-gray-600 mb-6">Your generous support helps us continue our mission and serve our community.</p>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">Financial Support</h3>
          <div className="space-y-6">
            {hasBankInfo ? (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Bank Transfer
                </h4>
              <div className="space-y-2 pl-2 text-sm">
                  {bank.bankName && (
                    <p><strong className="text-gray-700">Bank:</strong> <span className="text-gray-800">{bank.bankName}</span></p>
                  )}
                  {bank.accountName && (
                    <p><strong className="text-gray-700">Account Name:</strong> <span className="text-gray-800">{bank.accountName}</span></p>
                  )}
                  {bank.accountNumber && (
                    <p><strong className="text-gray-700">Account Number:</strong> <span className="text-gray-800 font-mono">{bank.accountNumber}</span></p>
                  )}
                  {bank.swiftCode && (
                    <p><strong className="text-gray-700">Swift Code:</strong> <span className="text-gray-800 font-mono">{bank.swiftCode}</span></p>
                  )}
              </div>
            </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-500 text-sm">Bank transfer information will be available soon.</p>
              </div>
            )}
            
            {hasMobileMoneyInfo ? (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Mobile Money
                </h4>
              <div className="space-y-2 pl-2 text-sm">
                  {mobileMoney.mtn && (
                    <p><strong className="text-gray-700">MTN:</strong> <span className="text-gray-800">{mobileMoney.mtn}</span></p>
                  )}
                  {mobileMoney.airtel && (
                    <p><strong className="text-gray-700">Airtel:</strong> <span className="text-gray-800">{mobileMoney.airtel}</span></p>
                  )}
              </div>
            </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-500 text-sm">Mobile money information will be available soon.</p>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">Online Donation</h3>
          {onlineDonationNote && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
              <p className="text-gray-700 text-sm">{onlineDonationNote}</p>
            </div>
          )}
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out shadow-lg">
            Donate via Paystack
          </button>
        </div>
      </div>
    </div>
  )
}






