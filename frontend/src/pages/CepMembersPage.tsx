import React from 'react'

export default function CepMembersPage() {
  React.useEffect(() => {
    window.location.href = '/admin/super-admins?tab=homepage&global=cepier-members'
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-700">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="font-medium">Redirecting to CEPier member approvals…</p>
      </div>
    </div>
  )
}

