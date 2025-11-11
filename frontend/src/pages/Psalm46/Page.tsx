import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { io } from 'socket.io-client'
import { Home, Users, Music, Menu, Info, Calendar, Clock, MapPin, History, Lightbulb, HeartHandshake, MessageCircle, Banknote, Smartphone, CreditCard, Play, Download, Maximize, Video, Send, Eye, X } from 'lucide-react'
import { getApiBaseUrl } from '../../utils/api'

type Song = { _id: string; title: string; url: string; downloadable?: boolean; mediaType?: 'audio' | 'video'; description?: string; category?: string; thumbnail?: string }
type Activity = { _id: string; title: string; description?: string; date?: string; time?: string; location?: string; image?: string; schedule?: string }

type Section = 'about'|'media'|'activities'|'ideas'|'support'|'chat'
type MediaFilter = 'all'|'video'|'audio'

export default function Psalm46Page() {
  const [section, setSection] = useState<Section>('about')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [songs, setSongs] = useState<Song[]>([])
  const [acts, setActs] = useState<{upcoming: Activity[]; regular: Activity[]; past: Activity[]}>({ upcoming: [], regular: [], past: [] })
  const [ideas, setIdeas] = useState<any[]>([])
  const [supportData, setSupportData] = useState<any>(null)
  const [loadingSupport, setLoadingSupport] = useState(false)
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all')
  const [fullscreenVideo, setFullscreenVideo] = useState<string | null>(null)
  const [failedVideos, setFailedVideos] = useState<Set<string>>(new Set())
  const [selectedEvent, setSelectedEvent] = useState<Activity | null>(null)
  
  // Chat state
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [userName, setUserName] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const baseUrl = useMemo(() => getApiBaseUrl(), [])
  const socketRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const groupParam = 'psalm46'

  // Filter songs to only show videos (no audio)
  const filteredSongs = useMemo(() => {
    return songs.filter(song => song.mediaType === 'video')
  }, [songs])

  // Get counts for each media type
  const mediaCounts = useMemo(() => {
    const videos = songs.filter(song => song.mediaType === 'video').length
    const audios = songs.filter(song => song.mediaType === 'audio').length
    return { all: songs.length, video: videos, audio: audios }
  }, [songs])

  // Helper function to convert YouTube URLs to embed format
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      let videoId = ''
      
      if (url.includes('youtube.com/watch?v=')) {
        const match = url.match(/[?&]v=([^&]+)/)
        if (match) {
          videoId = match[1]
        }
      } else if (url.includes('youtu.be/')) {
        const match = url.match(/youtu\.be\/([^?&]+)/)
        if (match) {
          videoId = match[1]
        }
      } else if (url.includes('youtube.com/embed/')) {
        return url
      }
      
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`
      }
      
      return url
    } catch (error) {
      console.error('Error processing YouTube URL:', error)
      return url
    }
  }

  // Check if URL is a valid YouTube URL
  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be')
  }

  // Fullscreen functionality
  const toggleFullscreen = (videoId: string) => {
    setFullscreenVideo(fullscreenVideo === videoId ? null : videoId)
  }

  const exitFullscreen = () => {
    setFullscreenVideo(null)
  }

  // Handle escape key to exit fullscreen and close event modal
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (fullscreenVideo) {
          exitFullscreen()
        }
        if (selectedEvent) {
          setSelectedEvent(null)
        }
      }
    }

    if (fullscreenVideo || selectedEvent) {
      document.addEventListener('keydown', handleKeyPress)
      return () => document.removeEventListener('keydown', handleKeyPress)
    }
  }, [fullscreenVideo, selectedEvent])

  const fetchSupportData = useCallback(async () => {
    try {
      setLoadingSupport(true)
      const response = await fetch(`${baseUrl}/api/home/support/${groupParam}`)
      const data = await response.json()
      
      if (data.success && data.support) {
        setSupportData(data.support)
      } else {
        setSupportData({
          bank: { bankName: '', accountName: '', accountNumber: '', swiftCode: '' },
          mobileMoney: { mtn: '', airtel: '' },
          onlineDonationNote: ''
        })
      }
    } catch (error) {
      console.error('Error fetching support data:', error)
      setSupportData({
        bank: { bankName: '', accountName: '', accountNumber: '', swiftCode: '' },
        mobileMoney: { mtn: '', airtel: '' },
        onlineDonationNote: ''
      })
    } finally {
      setLoadingSupport(false)
    }
  }, [baseUrl, groupParam])

  useEffect(() => {
    if (section === 'media') {
      // Fetch songs from public API with group parameter
      fetch(`${baseUrl}/api/choir/songs?group=${groupParam}`).then(r=>r.json()).then(setSongs).catch(()=>{})
    } else if (section === 'activities') {
      // Fetch events from public API with group parameter
      fetch(`${baseUrl}/api/choir/events?group=${groupParam}`).then(r=>r.json()).then(events => {
        // Transform events to activities format
        const now = new Date()
        const upcoming: Activity[] = []
        const past: Activity[] = []
        
        events.forEach((event: any) => {
          const eventDate = new Date(event.eventDate || event.date)
          const activity: Activity = {
            _id: event._id,
            title: event.title,
            description: event.description,
            date: event.eventDate || event.date,
            time: event.eventTime || event.time,
            location: event.location,
            image: event.imageUrl
          }
          
          if (eventDate >= now) {
            upcoming.push(activity)
          } else {
            past.push(activity)
          }
        })
        
        setActs({ upcoming, regular: [], past })
      }).catch(()=>{})
    } else if (section === 'ideas') {
      fetch(`${baseUrl}/api/choir/implemented-ideas?group=${groupParam}`).then(r=>r.json()).then(r=> setIdeas(r.data||[])).catch(()=>{})
    } else if (section === 'support') {
      fetchSupportData()
    }
  }, [section, baseUrl, groupParam, fetchSupportData])

  // Chat functionality
  useEffect(() => {
    if (section === 'chat' && isLoggedIn) {
      socketRef.current = io(baseUrl.replace('http://', 'ws://').replace('https://', 'wss://'))
      
      socketRef.current.on('connect', () => {
        console.log('Connected to chat server')
      })

      socketRef.current.on('message', (message: any) => {
        setMessages(prev => [...prev, message])
        scrollToBottom()
      })

      socketRef.current.on('typing', (data: { user: string; isTyping: boolean }) => {
        if (data.user !== userName) {
          setTypingUsers(prev => {
            if (data.isTyping) {
              return prev.includes(data.user) ? prev : [...prev, data.user]
            } else {
              return prev.filter(user => user !== data.user)
            }
          })
        }
      })

      socketRef.current.on('userJoined', (data: { user: string }) => {
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'system',
          message: `${data.user} joined the chat`,
          timestamp: new Date()
        }])
      })

      socketRef.current.on('userLeft', (data: { user: string }) => {
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'system',
          message: `${data.user} left the chat`,
          timestamp: new Date()
        }])
      })

      // Load previous messages
      fetch(`${baseUrl}/api/chat/messages`)
        .then(res => res.json())
        .then(data => setMessages(data.messages || []))
        .catch(() => {})

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect()
        }
      }
    }
  }, [section, baseUrl, userName, isLoggedIn])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() && userName.trim() && socketRef.current) {
      const message = {
        id: Date.now(),
        user: userName,
        message: newMessage.trim(),
        timestamp: new Date()
      }
      
      socketRef.current.emit('message', message)
      setNewMessage('')
      setIsTyping(false)
      socketRef.current.emit('typing', { user: userName, isTyping: false })
    }
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true)
      socketRef.current?.emit('typing', { user: userName, isTyping: true })
    } else if (isTyping && !e.target.value.trim()) {
      setIsTyping(false)
      socketRef.current?.emit('typing', { user: userName, isTyping: false })
    }
  }

  function submitIdea(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formEl = e.currentTarget
    const form = new FormData(formEl)
    const payload = {
      idea: String(form.get('idea') || ''),
      name: String(form.get('name') || ''),
      email: String(form.get('email') || ''),
      category: String(form.get('category') || 'other'),
      anonymous: Boolean(form.get('anonymous')),
    }
    if (!payload.idea) return
    fetch(`${baseUrl}/api/choir/ideas?group=${groupParam}`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) })
      .then(async (r) => {
        if (!r.ok) {
          let err
          try { err = await r.json() } catch { err = { message: 'Failed to submit idea' } }
          console.error('Idea submission error:', err)
          throw new Error(err.message || 'Failed to submit idea')
        }
        return r.json()
      })
      .then((data) => {
        console.log('Idea submitted successfully:', data)
        try { formEl.reset() } catch {}
        alert('Thank you for your idea! It has been submitted for review.')
        setSection('ideas')
      })
      .catch((error) => {
        console.error('Failed to submit idea:', error)
        alert('Failed to submit idea. Please try again.')
      })
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
      <header className="bg-blue-700 text-white shadow-lg p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-white p-2 hover:bg-blue-600 rounded-lg transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl md:text-3xl font-extrabold tracking-tight">CEP Huye College</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="flex items-center px-3 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-blue-600">
              <Home className="mr-2 w-5 h-5" /> Home
            </Link>
            <Link to="/families" className="flex items-center px-3 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-blue-600">
              <Users className="mr-2 w-5 h-5" /> Our Families
            </Link>
            <div className="flex items-center px-3 py-2 rounded-lg transition duration-300 ease-in-out bg-blue-800">
              <Users className="mr-2 w-5 h-5" /> Psalm 46 Family
            </div>
          </nav>
        </div>
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-blue-800 border-t border-blue-600">
            <nav className="container mx-auto py-4 space-y-2">
              <Link 
                to="/" 
                className="block px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/families" 
                className="block px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Our Families
              </Link>
              <div className="block px-4 py-2 rounded-lg bg-blue-900">
                Psalm 46 Family
              </div>
            </nav>
          </div>
        )}
      </header>
      <nav className="bg-blue-800 text-white shadow-md py-2 sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center md:justify-start space-x-1 md:space-x-4">
            {(['about','media','activities','ideas','support','chat'] as Section[]).map((s) => (
              <button key={s} onClick={() => setSection(s)} className={`px-3 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-blue-700 flex items-center ${section===s?'bg-blue-900':''}`}>
                <i data-lucide={s==='about'?'info': s==='media'?'music': s==='activities'?'calendar': s==='ideas'?'lightbulb': s==='support'?'heart-handshake':'message-circle'} className="mr-2 w-4 h-4" /> {s[0].toUpperCase()+s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </nav>
      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {section === 'about' && (
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center"><i data-lucide="info" className="mr-2 text-blue-600" /> About Psalm 46 Family</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="text-gray-700 leading-relaxed space-y-4">
                    <p>Psalm 46 Family is a Christian fellowship within CEP RP Huye, composed of believers who have accepted Christ and are eager to grow in their spiritual journey. It is a group that helps its members strengthen their faith, love one another, and support each other in everyday life. They meet regularly to share about their lives, give testimonies, study the Word of God together, and pray in unity so they may be strengthened by the Holy Spirit.</p>
                    
                    <p>The main purpose of Psalm 46 Family is to help Christians live a fulfilling life that glorifies God, building a strong relationship both with one another and with Him. They strive to show the love of Christ through their actions, words, and attitudes. This fellowship is characterized by love, unity, and a heart devoted to mutual support—both spiritually and physically.</p>
                    
                    <p>They believe that coming together as a family is a way to grow in faith and to remember that God is their ultimate refuge. They trust that even though the world is full of trials and challenges, God is always with them and protects them in every situation. Psalm 46 Family also engages in activities that bring people closer to one another, such as collective prayers, visiting the sick, and helping the needy.</p>
                    
                    <p>As the Word of God says in Psalm 46:1:</p>
                    
                    <blockquote className="border-l-4 border-blue-600 pl-4 py-2 italic text-gray-800 bg-blue-50 rounded-r-lg">
                      "God is our refuge and strength, an ever-present help in times of trouble."
                    </blockquote>
                  </div>
                  
                  <h3 className="text-2xl font-semibold text-gray-700 mb-3 mt-6">Leadership</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg"><h4 className="font-bold text-blue-800">Family Leader</h4><p className="text-gray-700">To be announced</p></div>
                    <div className="bg-blue-50 p-4 rounded-lg"><h4 className="font-bold text-blue-800">Assistant Leader</h4><p className="text-gray-700">To be announced</p></div>
                    <div className="bg-blue-50 p-4 rounded-lg"><h4 className="font-bold text-blue-800">Secretary</h4><p className="text-gray-700">To be announced</p></div>
                    <div className="bg-blue-50 p-4 rounded-lg"><h4 className="font-bold text-blue-800">Treasurer</h4><p className="text-gray-700">To be announced</p></div>
                  </div>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-blue-800 mb-4">Quick Facts</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start"><i data-lucide="users" className="mr-2 text-blue-600 mt-1 flex-shrink-0" /><span><strong>Growing community</strong> of men dedicated to spiritual growth and service</span></li>
                    <li className="flex items-start"><i data-lucide="heart-handshake" className="mr-2 text-blue-600 mt-1 flex-shrink-0" /><span><strong>Regular meetings</strong> for prayer, Bible study, and fellowship</span></li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {section === 'media' && (
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center"><i data-lucide="video" className="mr-2 text-blue-600" /> Videos</h2>
              
              {/* Show video count only */}
              <div className="mb-6">
                <div className="text-sm text-gray-600">
                  {`Showing ${mediaCounts.video} video${mediaCounts.video !== 1 ? 's' : ''}`}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">Videos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSongs.map(song => (
                    <div key={song._id} className="bg-gray-50 p-4 rounded-lg hover:bg-blue-50 transition">
                      <div className="mb-3">
                        {isYouTubeUrl(song.url) && !failedVideos.has(song._id) ? (
                          <div className="relative group" style={{paddingBottom:'56.25%',height:0,overflow:'hidden'}}>
                            <iframe 
                              src={`${getYouTubeEmbedUrl(song.url)}?rel=0&modestbranding=1&showinfo=0&controls=1&fs=1&enablejsapi=1&origin=${window.location.origin}`}
                              style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}} 
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                              allowFullScreen
                              className="rounded-lg"
                              title={song.title}
                              loading="lazy"
                              onError={() => {
                                console.error('Failed to load YouTube video:', song.url)
                                setFailedVideos(prev => new Set(prev).add(song._id))
                              }}
                              onLoad={() => {
                                console.log('YouTube video loaded successfully:', song.title)
                              }}
                            />
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => toggleFullscreen(song._id)}
                                className="bg-black bg-opacity-70 hover:bg-opacity-90 text-white p-2 rounded-lg transition-all duration-200"
                                title="Toggle fullscreen"
                              >
                                <Maximize className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : isYouTubeUrl(song.url) && failedVideos.has(song._id) ? (
                          <div className="relative group">
                            <div className="w-full h-48 bg-red-50 rounded-lg flex items-center justify-center border-2 border-red-200">
                              <div className="text-center p-4">
                                <Video className="w-12 h-12 text-red-400 mx-auto mb-2" />
                                <p className="text-sm text-red-600 mb-2">Video unavailable</p>
                                <button
                                  onClick={() => window.open(song.url, '_blank')}
                                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition block w-full"
                                >
                                  Watch on YouTube
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="relative group">
                            {song.thumbnail ? (
                              <img src={song.thumbnail} alt={song.title} className="w-full h-48 object-cover rounded-lg" />
                            ) : (
                              <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Video className="w-12 h-12 text-gray-400" />
                              </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <button 
                                onClick={() => window.open(song.url,'_blank')}
                                className="bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 transition"
                              >
                                <Play className="w-8 h-8 text-white" />
                              </button>
                            </div>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => toggleFullscreen(song._id)}
                                className="bg-black bg-opacity-70 hover:bg-opacity-90 text-white p-2 rounded-lg transition-all duration-200"
                                title="Toggle fullscreen"
                              >
                                <Maximize className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-1">{song.title}</h4>
                      {song.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{song.description}</p>
                      )}
                      {song.category && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">{song.category}</span>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center">
                          <Video className="w-4 h-4 mr-1" />
                          Video
                        </span>
                        {song.downloadable && (
                          <span className="flex items-center text-green-600">
                            <Download className="w-4 h-4 mr-1" />
                            Downloadable
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {filteredSongs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Video className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No videos available yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {section === 'activities' && (
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center"><i data-lucide="calendar" className="mr-2 text-blue-600" /> Family Activities</h2>
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">Upcoming Events</h3>
                {acts.upcoming.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <i data-lucide="calendar" className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No upcoming events scheduled yet.</p>
                  </div>
                ) : (
                  acts.upcoming.map(ev => (
                  <div key={ev._id} className="bg-blue-50 p-4 rounded-lg mb-4 border-l-4 border-blue-600 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xl font-bold text-blue-800">{ev.title}</h4>
                          <button
                            onClick={() => setSelectedEvent(ev)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                        </div>
                        <p className="text-gray-700 mt-2 line-clamp-2">{ev.description}</p>
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                          {ev.date && <div className="flex items-center"><Calendar className="inline mr-1 w-4 h-4" />{new Date(ev.date).toLocaleDateString()}</div>}
                          {ev.time && <div className="flex items-center"><Clock className="inline mr-1 w-4 h-4" />{ev.time}</div>}
                          {ev.location && <div className="flex items-center"><MapPin className="inline mr-1 w-4 h-4" />{ev.location}</div>}
                        </div>
                      </div>
                      {ev.image && (
                        <div className="mt-4 md:mt-0 md:ml-4 cursor-pointer" onClick={() => setSelectedEvent(ev)}>
                          <img 
                            src={ev.image} 
                            alt={ev.title} 
                            className="w-32 h-24 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            onError={(e) => {
                              console.error('Failed to load event image:', ev.image)
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                      </div>
                      )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mb-8">
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">Regular Activities</h3>
                {acts.regular.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <i data-lucide="calendar" className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No regular activities scheduled yet.</p>
                  </div>
                ) : (
                  acts.regular.map(ev => (
                    <div key={ev._id} className="bg-gray-50 p-4 rounded-lg mb-4 border-l-4 border-gray-400 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedEvent(ev)}>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-semibold text-gray-800">{ev.title}</h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedEvent(ev)
                              }}
                              className="flex items-center gap-1 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                          </div>
                          <div className="mt-2 md:mt-0 text-sm text-gray-600">
                            {ev.schedule && <div className="flex items-center mb-1"><Clock className="inline mr-1 w-4 h-4" />{ev.schedule}</div>}
                            {ev.location && <div className="flex items-center"><MapPin className="inline mr-1 w-4 h-4" />{ev.location}</div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">Past Activities</h3>
                {acts.past.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <i data-lucide="history" className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No past activities to display yet.</p>
                  </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {acts.past.map(ev => (
                    <div key={ev._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedEvent(ev)}>
                      {ev.image && (
                        <img 
                          src={ev.image} 
                          alt={ev.title} 
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            console.error('Failed to load event image:', ev.image)
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      )}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-gray-800">{ev.title}</h4>
                          <Eye className="w-4 h-4 text-gray-400" />
                        </div>
                        {ev.date && <p className="text-sm text-gray-600 mb-2 flex items-center"><Calendar className="inline mr-1 w-4 h-4" />{new Date(ev.date).toLocaleDateString()}</p>}
                        <p className="text-gray-700 text-sm line-clamp-2">{ev.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </div>
            </div>
          )}

          {section === 'ideas' && (
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center"><i data-lucide="lightbulb" className="mr-2 text-blue-600" /> Share Your Ideas</h2>
                <form className="space-y-4" onSubmit={submitIdea}>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Your Name (Optional)</label>
                    <input name="name" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Your full name" />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Email (Optional)</label>
                    <input name="email" type="email" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="your.email@example.com" />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
                    <select name="category" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="song">Song/Music</option>
                      <option value="performance">Performance</option>
                      <option value="event">Event</option>
                      <option value="improvement">Improvement</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Your Idea *</label>
                    <textarea name="idea" rows={5} required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Describe your idea in detail..." />
                  </div>
                  
                  <div className="flex items-center">
                    <input type="checkbox" name="anonymous" id="anonymous" className="mr-2" />
                    <label htmlFor="anonymous" className="text-gray-700 text-sm">Submit anonymously</label>
                  </div>
                  
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out shadow-lg flex items-center">
                    <i data-lucide="send" className="mr-2 w-5 h-5" /> Submit Idea
                  </button>
                </form>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">Recent Implemented Ideas</h3>
                <div className="space-y-4">
                  {ideas.length === 0 ? <p className="text-gray-600">No implemented ideas yet.</p> : ideas.map((it: any) => (
                    <div key={it._id} className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-gray-800 font-medium">"{it.idea}"</p>
                      <p className="text-sm text-gray-600 mt-1">Suggested by {it.anonymous ? 'Anonymous' : (it.name || 'a member')} {it.implementedDate ? ` • Implemented ${new Date(it.implementedDate).toLocaleDateString()}` : ''}</p>
                    </div>
                  ))}
                </div>
              </div>
              </div>
            </div>
          )}

          {section === 'support' && (
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center"><i data-lucide="heart-handshake" className="mr-2 text-blue-600" /> Support Our Family</h2>
              {loadingSupport ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-pulse text-gray-600">Loading support information...</div>
                </div>
              ) : (
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-700 mb-4">Financial Support</h3>
                  <div className="space-y-6">
                      {(supportData?.bank?.bankName || supportData?.bank?.accountName || supportData?.bank?.accountNumber || supportData?.bank?.swiftCode) && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-bold text-blue-800 mb-2 flex items-center"><i data-lucide="banknote" className="mr-2" /> Bank Transfer</h4>
                          <div className="space-y-2 pl-6 text-sm">
                            {supportData?.bank?.bankName && (
                              <p><strong>Bank:</strong> {supportData.bank.bankName}</p>
                            )}
                            {supportData?.bank?.accountName && (
                              <p><strong>Account Name:</strong> {supportData.bank.accountName}</p>
                            )}
                            {supportData?.bank?.accountNumber && (
                              <p><strong>Account Number:</strong> {supportData.bank.accountNumber}</p>
                            )}
                            {supportData?.bank?.swiftCode && (
                              <p><strong>Swift Code:</strong> {supportData.bank.swiftCode}</p>
                            )}
                    </div>
                        </div>
                      )}
                      {(supportData?.mobileMoney?.mtn || supportData?.mobileMoney?.airtel) && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-bold text-green-800 mb-2 flex items-center"><i data-lucide="smartphone" className="mr-2" /> Mobile Money</h4>
                          <div className="space-y-2 pl-6 text-sm">
                            {supportData?.mobileMoney?.mtn && (
                              <p><strong>MTN:</strong> {supportData.mobileMoney.mtn}</p>
                            )}
                            {supportData?.mobileMoney?.airtel && (
                              <p><strong>Airtel:</strong> {supportData.mobileMoney.airtel}</p>
                            )}
                    </div>
                        </div>
                      )}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-700 mb-4">Online Donation</h3>
                    <p className="text-gray-700 mb-4">
                      {supportData?.onlineDonationNote || 'Paystack verification pending server integration.'}
                    </p>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out shadow-lg flex items-center justify-center"><i data-lucide="credit-card" className="mr-2 w-5 h-5" /> Donate via Paystack</button>
                </div>
              </div>
              )}
            </div>
          )}

          {section === 'chat' && (
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <i data-lucide="message-circle" className="mr-2 text-blue-600" /> 
                Family Chat
              </h2>
              
              {!isLoggedIn ? (
                <div className="max-w-md mx-auto">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold text-blue-800 mb-4">Login to Continue</h3>
                    <p className="text-gray-700 mb-4">Please login to access the family chat.</p>
                    
                    {loginError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {loginError}
                      </div>
                    )}
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault()
                        if (!loginForm.username.trim() || !loginForm.password.trim()) return
                        
                        setIsLoggingIn(true)
                        setLoginError('')
                        
                        try {
                          const response = await fetch(`${baseUrl}/api/auth/login`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              username: loginForm.username.trim(),
                              password: loginForm.password,
                              userGroup: 'psalm46'
                            })
                          })
                          
                          const data = await response.json()
                          
                          if (data.success) {
                            sessionStorage.setItem('chatUser', data.user.username)
                            sessionStorage.setItem('userInfo', JSON.stringify(data.user))
                            sessionStorage.setItem('userGroup', data.user.userGroup || 'psalm46')
                            setUserName(data.user.username)
                            setIsLoggedIn(true)
                            window.location.href = '/psalm46/chat'
                          } else {
                            setLoginError(data.message || 'Login failed')
                          }
                        } catch (error) {
                          setLoginError('Network error. Please try again.')
                        } finally {
                          setIsLoggingIn(false)
                        }
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                          type="text"
                          value={loginForm.username}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                          placeholder="Enter your username"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                          type="password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter your password"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <button
                          type="button"
                          onClick={() => window.location.href = '/psalm46/forgot-password'}
                          className="text-blue-700 hover:text-blue-900"
                        >
                          Forgot password?
                        </button>
                        <button
                          type="button"
                          onClick={() => window.location.href = '/psalm46/register'}
                          className="text-blue-700 hover:text-blue-900"
                        >
                          Register
                        </button>
                      </div>
                      <button
                        type="submit"
                        disabled={isLoggingIn}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-2 px-4 rounded-lg transition duration-300 disabled:cursor-not-allowed"
                      >
                        {isLoggingIn ? 'Logging in...' : 'Login'}
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto">
                  <div className="bg-blue-50 p-6 rounded-lg text-center">
                    <p className="mb-4">You are logged in as <strong>{userName}</strong>. Redirecting to chat...</p>
                    <button onClick={() => (window.location.href = '/psalm46/chat')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Go to Chat</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center mt-8">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} CEP Huye College. All rights reserved.</p>
          <p className="text-sm mt-2">Psalm 46 Family - Growing in faith and serving with purpose</p>
        </div>
      </footer>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 bg-gray-800 hover:bg-gray-900 text-white p-2 rounded-full transition-all duration-200 z-20 shadow-lg"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              {selectedEvent.image && (
                <img 
                  src={selectedEvent.image} 
                  alt={selectedEvent.title} 
                  className="w-full h-64 md:h-96 object-cover rounded-t-lg"
                  onError={(e) => {
                    console.error('Failed to load event image:', selectedEvent.image)
                    e.currentTarget.style.display = 'none'
                  }}
                />
              )}
              
              <div className="p-6 md:p-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{selectedEvent.title}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-200">
                  {selectedEvent.date && (
                    <div className="flex items-center text-gray-700">
                      <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-semibold">{new Date(selectedEvent.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</p>
                      </div>
                    </div>
                  )}
                  {selectedEvent.time && (
                    <div className="flex items-center text-gray-700">
                      <Clock className="w-5 h-5 mr-2 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="font-semibold">{selectedEvent.time}</p>
                      </div>
                    </div>
                  )}
                  {selectedEvent.location && (
                    <div className="flex items-center text-gray-700">
                      <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-semibold">{selectedEvent.location}</p>
                      </div>
                    </div>
                  )}
                </div>

                {selectedEvent.description && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                      <Info className="w-5 h-5 mr-2 text-blue-600" />
                      About This Event
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedEvent.description}</p>
                  </div>
                )}

                {selectedEvent.schedule && (
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-blue-600" />
                      Schedule
                    </h3>
                    <p className="text-gray-700">{selectedEvent.schedule}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Video Modal */}
      {fullscreenVideo && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={exitFullscreen}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-70 hover:bg-opacity-90 text-white p-3 rounded-lg transition-all duration-200"
              title="Exit fullscreen (ESC)"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="w-full h-full flex items-center justify-center p-4">
              {(() => {
                const song = songs.find(s => s._id === fullscreenVideo)
                if (!song) return null
                
                if (song.url.includes('youtube.com') || song.url.includes('youtu.be')) {
                  return (
                    <div className="w-full h-full max-w-6xl">
                      <iframe 
                        src={getYouTubeEmbedUrl(song.url)} 
                        className="w-full h-full rounded-lg"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        title={song.title}
                        allowFullScreen
                      />
                    </div>
                  )
                } else {
                  return (
                    <div className="w-full h-full flex items-center justify-center">
                      <video 
                        src={song.url}
                        controls
                        autoPlay
                        className="w-full h-full max-w-6xl rounded-lg"
                        title={song.title}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )
                }
              })()}
            </div>
            
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 text-white p-4 rounded-lg">
              <h3 className="text-xl font-bold mb-2">{songs.find(s => s._id === fullscreenVideo)?.title}</h3>
              {songs.find(s => s._id === fullscreenVideo)?.description && (
                <p className="text-sm opacity-90">{songs.find(s => s._id === fullscreenVideo)?.description}</p>
              )}
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs opacity-75">
                  Press ESC to exit fullscreen
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-blue-600 px-2 py-1 rounded">
                    {songs.find(s => s._id === fullscreenVideo)?.category || 'Video'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
          