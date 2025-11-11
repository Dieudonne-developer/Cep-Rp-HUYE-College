import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function CepMembersPage() {
  const navigate = useNavigate()
  
  React.useEffect(() => {
    navigate('/admin/super-admins?tab=homepage&global=cepier-members')
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-700">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="font-medium">Redirecting to CEPier member approvals…</p>
      </div>
    </div>
  )
}

