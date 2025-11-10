import React from 'react'

export default function AnointedPublicPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
      <header className="p-6 shadow-md bg-black bg-opacity-10">
        <div className="container mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight">Anointed worship team</h1>
          <p className="text-purple-100 mt-1">Public page</p>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white text-gray-800 rounded-xl p-6 shadow">
            <h2 className="text-xl font-bold mb-2">About</h2>
            <p className="text-gray-700">
              The Anointed worship team leads worship through music and service. Explore songs, events, and fellowship opportunities.
            </p>
          </div>
          <div className="bg-white text-gray-800 rounded-xl p-6 shadow">
            <h2 className="text-xl font-bold mb-2">Get Involved</h2>
            <div className="space-x-3">
              <a href="/anointed/chat" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">Open Chat</a>
              <a href="/anointed/register" className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg">Register</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}








