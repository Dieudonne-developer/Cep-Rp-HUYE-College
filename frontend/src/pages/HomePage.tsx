import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Info, Users } from 'lucide-react'

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [home, setHome] = useState<{ title: string; description: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
    fetch(`${baseUrl}/api/home`)
      .then((r) => r.json())
      .then((response) => {
        // Handle backend response structure
        if (response.success && response.data) {
          setHome({
            title: response.data.title,
            description: response.data.description
          })
        } else {
          // Fallback for direct data structure
          setHome(response)
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load')
        setLoading(false)
      })
  }, [])


  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">{home?.title || 'CEP Huye College'}</h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        {loading ? 'Loading…' : error ? 'Failed to load content.' : home?.description}
      </p>
      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <Link to="/about">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out shadow-lg flex items-center">
            <Info className="mr-2 w-5 h-5" /> About Us
          </button>
        </Link>
        <Link to="/families">
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-300 ease-in-out shadow-lg flex items-center">
            <Users className="mr-2 w-5 h-5" /> Our Families
          </button>
        </Link>
      </div>
      <p className="text-gray-600 mt-4">
        Your userId: <span className="font-mono text-sm bg-gray-100 p-1 rounded">demo-user-id</span>
      </p>
    </div>
  )
}









