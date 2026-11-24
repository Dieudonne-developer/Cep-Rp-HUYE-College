import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Info, Users } from 'lucide-react'
import { getApiBaseUrl } from '../utils/api'

interface Slide {
  _id: string
  imageUrl: string
  caption?: string
}

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [home, setHome] = useState<{ title: string; description: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [slides, setSlides] = useState<Slide[]>([])
  const [slideIndex, setSlideIndex] = useState(0)

  useEffect(() => {
    const baseUrl = getApiBaseUrl()
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

    fetch(`${baseUrl}/api/home/slides`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.slides)) setSlides(data.slides)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (slides.length < 2) return
    const timer = setInterval(() => {
      setSlideIndex((i) => (i + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [slides.length])

  const heroContent = (
    <>
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">{home?.title || 'CEP Huye College'}</h2>
      <p className="text-white/90 leading-relaxed mb-6 max-w-2xl drop-shadow">
        {loading ? 'Loading…' : error ? 'Failed to load content.' : home?.description}
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
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
    </>
  )

  return (
    <div className="rounded-lg shadow-md overflow-hidden">
      {slides.length > 0 ? (
        <div className="relative h-[420px] md:h-[480px] w-full bg-gray-900">
          {slides.map((slide, i) => (
            <img
              key={slide._id}
              src={slide.imageUrl}
              alt={slide.caption || 'CEP Huye College'}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === slideIndex ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            {heroContent}
          </div>
          {slides.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {slides.map((slide, i) => (
                <button
                  key={slide._id}
                  onClick={() => setSlideIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`w-3 h-3 rounded-full transition-colors ${i === slideIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/80'}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 bg-white">
          {heroContent}
          <p className="text-gray-600 mt-4">
            Your userId: <span className="font-mono text-sm bg-gray-100 p-1 rounded">demo-user-id</span>
          </p>
        </div>
      )}
    </div>
  )
}
