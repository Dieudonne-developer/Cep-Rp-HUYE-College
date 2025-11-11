import React, { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getApiBaseUrl } from '../utils/api'

type Family = {
  id: number
  name: string
  description: string
  link?: string
}

export default function FamiliesPage() {
  const navigate = useNavigate()
  const [families, setFamilies] = useState<Family[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const baseUrl = getApiBaseUrl()
    fetch(`${baseUrl}/api/families`)
      .then((r) => r.json())
      .then((response) => {
        // Handle backend response structure
        const incoming = response && response.success && response.data
          ? response.data
          : (Array.isArray(response) ? response : [])

        // Normalize names and ensure required families exist on frontend too
        const renamed = incoming.map((f: any) => {
          const map: Record<string, string> = {
            'Youth Ministry': 'Anointed worship team',
            "Women's Fellowship": 'Abanyamugisha family',
            "Men's Ministry": 'Psalm 23 family',
            "Children's Ministry": 'Psalm 46 family',
            'Outreach & Missions': 'Protocol family'
          }
          const newName = map[f?.name] || f?.name
          return { ...f, name: newName }
        })

        const ensureSet = (arr: any[]) => {
          const byName = new Set(arr.map((x) => x.name))
          const additions = [] as any[]
          if (!byName.has('Social family')) {
            additions.push({ id: 1001, name: 'Social family', description: 'Fellowship and care focused family strengthening bonds and community support.', link: '#' })
          }
          if (!byName.has('Evangelical family')) {
            additions.push({ id: 1002, name: 'Evangelical family', description: 'Passionate about outreach and sharing the Gospel through word and action.', link: '#' })
          }
          return [...arr, ...additions]
        }

        setFamilies(ensureSet(renamed))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])


  function navigateTo(link?: string) {
    if (!link || link === '#') {
      alert('This family page is coming soon!')
      return
    }
    // Use React Router navigation for client-side routing
    // This prevents full page reloads and 404 errors on static sites
    if (link.startsWith('/')) {
      navigate(link)
    } else {
      // For external links, use window.location
      window.location.href = link
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <button
        onClick={() => window.history.back()}
        className="mb-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400"
      >
        &larr; Back to Home Overview
      </button>
      <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <Users className="mr-2 text-purple-600" /> Our Families
      </h3>
      <p className="text-gray-700 leading-relaxed mb-4">
        Like other churches, CEP-RP Huye College is built upon various active groups working together to build up the ministry.
        Each family contributes uniquely to our community and mission.
      </p>
      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {families.map((f) => (
            <div
              key={f.id}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                navigateTo(f.link)
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { 
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigateTo(f.link)
                }
              }}
              className="bg-gray-50 hover:bg-gray-100 cursor-pointer text-gray-800 font-semibold py-4 px-4 rounded-lg shadow-sm border border-gray-200 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="text-center">
                <h4 className="text-lg font-bold text-blue-800 mb-2">{f.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{f.description}</p>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    navigateTo(f.link)
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
                >
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


