import React, { useEffect, useState } from 'react'

export default function MemberPage() {
  const [user, setUser] = useState<any>(null)
  const [group, setGroup] = useState<string>('choir')

  useEffect(() => {
    try {
      const info = sessionStorage.getItem('userInfo')
      const g = sessionStorage.getItem('userGroup')
      if (info) setUser(JSON.parse(info))
      if (g) setGroup(g)
    } catch {}
  }, [])

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Member</h2>
      {!user ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4">
          You are not logged in. Please go to <a href="/chat" className="text-blue-700 underline">Chat</a> to login.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Group:</strong> {user.userGroup || group}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={`/${user.userGroup || group}/chat`} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">Open Chat</a>
            <a href={`/${user.userGroup || group}`} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">Open Family Page</a>
            <a href={`/`} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">CEPier Home</a>
          </div>
        </div>
      )}
    </div>
  )
}


