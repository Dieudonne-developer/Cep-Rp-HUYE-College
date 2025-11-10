import React, { useEffect, useState } from 'react'
import { useLucideIcons } from '../../../utils/lucideIcons'

export default function AdminSupport() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
  const adminGroup = (() => {
    try {
      const raw = localStorage.getItem('admin')
      if (!raw) return 'choir'
      const obj = JSON.parse(raw)
      return obj?.adminGroup || 'choir'
    } catch { return 'choir' }
  })()

  const [supportDoc, setSupportDoc] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [savingSupport, setSavingSupport] = useState(false)

  const groupQuery = adminGroup === 'anointed' ? 'group=anointed' : adminGroup === 'abanyamugisha' ? 'group=abanyamugisha' : adminGroup === 'psalm23' ? 'group=psalm23' : adminGroup === 'psalm46' ? 'group=psalm46' : adminGroup === 'protocol' ? 'group=protocol' : adminGroup === 'social' ? 'group=social' : adminGroup === 'evangelical' ? 'group=evangelical' : adminGroup === 'cepier' ? 'group=cepier' : 'group=choir'

  useEffect(() => {
    fetchSupport()
  }, [])

  useLucideIcons()

  async function fetchSupport() {
    try {
      setLoading(true)
      const adminRaw = localStorage.getItem('admin')
      const admin = adminRaw ? JSON.parse(adminRaw) : {}
      const res = await fetch(`${baseUrl}/api/admin/support?${groupQuery}`, { 
        headers: { 
          'X-Admin-Group': adminGroup,
          'X-Admin-Email': admin?.email || '' 
        } 
      })
      const data = await res.json()
      if (data.success && data.support) {
        // Ensure nested objects exist
        const support = {
          ...data.support,
          bank: data.support.bank || { bankName: '', accountName: '', accountNumber: '', swiftCode: '' },
          mobileMoney: data.support.mobileMoney || { mtn: '', airtel: '' },
          onlineDonationNote: data.support.onlineDonationNote || ''
        }
        setSupportDoc(support)
      } else {
        // Initialize with empty structure if no data
        setSupportDoc({
          bank: { bankName: '', accountName: '', accountNumber: '', swiftCode: '' },
          mobileMoney: { mtn: '', airtel: '' },
          onlineDonationNote: ''
        })
      }
    } catch (error) {
      console.error('Failed to fetch support:', error)
      // Initialize with empty structure on error
      setSupportDoc({
        bank: { bankName: '', accountName: '', accountNumber: '', swiftCode: '' },
        mobileMoney: { mtn: '', airtel: '' },
        onlineDonationNote: ''
      })
    } finally {
      setLoading(false)
    }
  }

  async function saveSupport(e: React.FormEvent) {
    e.preventDefault()
    setSavingSupport(true)
    try {
      // Ensure we send the complete structure
      const payload = {
        bank: {
          bankName: supportDoc?.bank?.bankName || '',
          accountName: supportDoc?.bank?.accountName || '',
          accountNumber: supportDoc?.bank?.accountNumber || '',
          swiftCode: supportDoc?.bank?.swiftCode || ''
        },
        mobileMoney: {
          mtn: supportDoc?.mobileMoney?.mtn || '',
          airtel: supportDoc?.mobileMoney?.airtel || ''
        },
        onlineDonationNote: supportDoc?.onlineDonationNote || ''
      }

      const adminRaw = localStorage.getItem('admin')
      const admin = adminRaw ? JSON.parse(adminRaw) : {}
      const res = await fetch(`${baseUrl}/api/admin/support?${groupQuery}`, { 
        method: 'PUT', 
        headers: { 
          'Content-Type': 'application/json',
          'X-Admin-Group': adminGroup,
          'X-Admin-Email': admin?.email || '' 
        }, 
        body: JSON.stringify(payload) 
      })
      const data = await res.json()
      if (data.success) {
        alert('Support information saved successfully! The support page has been updated.')
        fetchSupport() // Refresh to show updated data
      } else {
        alert(data.message || 'Failed to save support information')
      }
    } catch (error) {
      console.error('Error saving support:', error)
      alert('Failed to save support information. Please try again.')
    } finally { 
      setSavingSupport(false) 
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Manage Support Page</h1>
        <p className="text-sm text-gray-600">Update the information displayed on your group's support page</p>
      </div>

      <form onSubmit={saveSupport} className="bg-white rounded-lg border border-gray-200 p-6 shadow-md">
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <i data-lucide="building-2" className="w-5 h-5"></i>
            Bank Transfer Information
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="e.g., Bank of Kigali" 
                value={supportDoc?.bank?.bankName||''} 
                onChange={(e)=>setSupportDoc((d:any)=>({...d, bank:{...d?.bank, bankName:e.target.value}}))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="e.g., CEP Ishyanga Ryera Choir" 
                value={supportDoc?.bank?.accountName||''} 
                onChange={(e)=>setSupportDoc((d:any)=>({...d, bank:{...d?.bank, accountName:e.target.value}}))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono" 
                placeholder="e.g., 00040-06945783-07" 
                value={supportDoc?.bank?.accountNumber||''} 
                onChange={(e)=>setSupportDoc((d:any)=>({...d, bank:{...d?.bank, accountNumber:e.target.value}}))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Swift Code</label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono" 
                placeholder="e.g., BKIGRWRW" 
                value={supportDoc?.bank?.swiftCode||''} 
                onChange={(e)=>setSupportDoc((d:any)=>({...d, bank:{...d?.bank, swiftCode:e.target.value}}))} 
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <i data-lucide="smartphone" className="w-5 h-5"></i>
            Mobile Money Information
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">MTN Mobile Money</label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="e.g., 0788 123 456 (Alice Uwase)" 
                value={supportDoc?.mobileMoney?.mtn||''} 
                onChange={(e)=>setSupportDoc((d:any)=>({...d, mobileMoney:{...d?.mobileMoney, mtn:e.target.value}}))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Airtel Money</label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="e.g., 0732 987 654 (Eric Mugisha)" 
                value={supportDoc?.mobileMoney?.airtel||''} 
                onChange={(e)=>setSupportDoc((d:any)=>({...d, mobileMoney:{...d?.mobileMoney, airtel:e.target.value}}))} 
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <i data-lucide="credit-card" className="w-5 h-5"></i>
            Online Donation
          </h4>
          <label className="block text-sm font-medium text-gray-700 mb-1">Donation Note/Message</label>
          <textarea 
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            rows={3}
            placeholder="e.g., Paystack verification pending server integration." 
            value={supportDoc?.onlineDonationNote||''} 
            onChange={(e)=>setSupportDoc((d:any)=>({...d, onlineDonationNote:e.target.value}))} 
          />
          <p className="text-xs text-gray-500 mt-1">This message will appear on the support page above the donation button.</p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button 
            type="button"
            onClick={() => fetchSupport()}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button 
            type="submit"
            disabled={savingSupport} 
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {savingSupport ? (
              <>
                <i data-lucide="loader-2" className="w-4 h-4 animate-spin"></i>
                Saving...
              </>
            ) : (
              <>
                <i data-lucide="save" className="w-4 h-4"></i>
                Save Support Information
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}





