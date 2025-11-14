import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { getApiBaseUrl } from '../../utils/api'

// Extend Navigator interface for getUserMedia
declare global {
  interface Navigator {
    getUserMedia?: (constraints: MediaStreamConstraints, successCallback: (stream: MediaStream) => void, errorCallback: (error: any) => void) => void
  }
}

type Message = {
  id: string | number
  user: string
  message: string
  timestamp: Date | string
  type?: 'user' | 'system' | 'voice' | 'file'
  avatar?: string
  status?: 'sending' | 'sent' | 'delivered' | 'read'
  voiceNote?: {
    url: string
    duration: number
    waveform?: number[]
  }
  fileAttachment?: {
    fileName: string
    fileSize: number
    fileType: 'image' | 'video' | 'audio' | 'document'
    mimeType: string
    fileUrl: string
    thumbnailUrl?: string
    duration?: number
    dimensions?: {
      width: number
      height: number
    }
  }
}

type User = {
  name: string
  avatar: string
  isOnline: boolean
  lastSeen?: Date
}

export default function ChatPage() {
  // Determine user group from URL pathname
  const userGroup = useMemo(() => {
    const path = window.location.pathname.toLowerCase()
    if (path.includes('/admin/chat')) return 'admins'
    if (path.includes('/cepier/chat')) return 'cepier'
    if (path.includes('/choir/chat')) return 'choir'
    if (path.includes('/anointed/chat')) return 'anointed'
    if (path.includes('/abanyamugisha/chat')) return 'abanyamugisha'
    if (path.includes('/psalm23/chat')) return 'psalm23'
    if (path.includes('/psalm46/chat')) return 'psalm46'
    if (path.includes('/protocol/chat')) return 'protocol'
    if (path.includes('/social/chat')) return 'social'
    if (path.includes('/evangelical/chat')) return 'evangelical'
    // Fallback: check sessionStorage or default to choir
    const stored = sessionStorage.getItem('userGroup')
    return stored || 'choir'
  }, [])

  const groupDisplayName = useMemo(() => {
    const names: Record<string, string> = {
      admins: 'Admin Chat',
      cepier: 'CEPier Chat',
      choir: 'Ishyanga Ryera Choir',
      anointed: 'Anointed Worship Team',
      abanyamugisha: 'Abanyamugisha Family',
      psalm23: 'Psalm 23 Family',
      psalm46: 'Psalm 46 Family',
      protocol: 'Protocol Family',
      social: 'Social Family',
      evangelical: 'Evangelical Family'
    }
    return names[userGroup] || 'CEP Chat'
  }, [userGroup])

  const createPatternSvg = (label: string) => {
    const sanitizedLabel = label.replace(/&/g, '&amp;')
    return encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <defs>
          <pattern id="chat-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            <text x="15" y="35" font-family="Arial, sans-serif" font-size="12" fill="%23e5ddd5" opacity="0.4" transform="rotate(-20 15 35)">${sanitizedLabel}</text>
            <text x="120" y="60" font-family="Arial, sans-serif" font-size="10" fill="%23e5ddd5" opacity="0.3" transform="rotate(25 120 60)">CEP Huye College</text>
            <text x="50" y="120" font-family="Arial, sans-serif" font-size="24" fill="%23e5ddd5" opacity="0.35" transform="rotate(-15 50 120)">✨</text>
            <text x="150" y="140" font-family="Arial, sans-serif" font-size="24" fill="%23e5ddd5" opacity="0.35" transform="rotate(15 150 140)">🎵</text>
            <text x="30" y="170" font-family="Arial, sans-serif" font-size="10" fill="%23e5ddd5" opacity="0.3" transform="rotate(30 30 170)">${sanitizedLabel}</text>
            <text x="160" y="40" font-family="Arial, sans-serif" font-size="10" fill="%23e5ddd5" opacity="0.3" transform="rotate(-30 160 40)">🎼</text>
            <text x="90" y="100" font-family="Arial, sans-serif" font-size="9" fill="%23e5ddd5" opacity="0.3" transform="rotate(-10 90 100)">${sanitizedLabel}</text>
          </pattern>
        </defs>
        <rect width="200" height="200" fill="url(%23chat-pattern)" />
      </svg>
    `)
  }

  const chatBackgroundStyle = useMemo(() => {
    const palette = userGroup === 'admins'
      ? {
          primary: 'rgba(59, 130, 246, 0.04)',
          secondary: 'rgba(99, 102, 241, 0.04)',
          tertiary: 'rgba(37, 99, 235, 0.03)',
          base: '#eef2ff'
        }
      : {
          primary: 'rgba(37, 211, 102, 0.03)',
          secondary: 'rgba(18, 140, 126, 0.03)',
          tertiary: 'rgba(37, 211, 102, 0.02)',
          base: '#f9fafb'
        }

    const patternSvg = createPatternSvg(groupDisplayName)

    return {
      backgroundColor: palette.base,
      backgroundImage: `
        radial-gradient(circle at 20% 20%, ${palette.primary} 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, ${palette.secondary} 0%, transparent 50%),
        radial-gradient(circle at 40% 60%, ${palette.tertiary} 0%, transparent 50%),
        url("data:image/svg+xml,${patternSvg}")
      `,
      backgroundSize: '200px 200px, 200px 200px, 200px 200px, 200px 200px',
      backgroundPosition: '0 0, 100px 100px, 50px 50px, 0 0',
      backgroundRepeat: 'repeat'
    }
  }, [groupDisplayName, userGroup])
  
  const roomName = `${userGroup}-chat`
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [userName, setUserName] = useState<string>(() => {
    return sessionStorage.getItem('chatUser') || ''
  })
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])
  const [showSidebar, setShowSidebar] = useState(true)
  const [showContactsModal, setShowContactsModal] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [fullscreenImage, setFullscreenImage] = useState<{ url: string; fileName: string } | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const [recordingTimer, setRecordingTimer] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showFilePicker, setShowFilePicker] = useState(false)
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null)
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set())
  const [downloadProgress, setDownloadProgress] = useState<{[key: string]: number}>({})
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [isVoiceSupported, setIsVoiceSupported] = useState(true)
  const [isPressingMic, setIsPressingMic] = useState(false)
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null)

  const navigate = useNavigate()
  const baseUrl = useMemo(() => getApiBaseUrl(), [])
  const socketRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get user profile image from sessionStorage
  const [userProfileImage, setUserProfileImage] = useState<string | null>(() => {
    const userInfo = sessionStorage.getItem('userInfo')
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo)
        console.log('User info from sessionStorage:', parsed)
        return parsed.profileImage || null
      } catch (e) {
        console.error('Error parsing userInfo:', e)
        return null
      }
    }
    console.log('No userInfo in sessionStorage')
    return null
  })

  // Store user avatars map
  const [userAvatars, setUserAvatars] = useState<{[key: string]: string}>({})

  // Generate avatar URL based on username
  const getAvatarUrl = (name: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']
    const color = colors[name.length % colors.length]
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color.replace('#', '')}&color=fff&size=200&bold=true`
  }

  // Get user's avatar URL (profile image or generated)
  const getUserAvatarUrl = (name: string) => {
    // First check if we have the profile image in our map
    if (userAvatars[name]) {
      return userAvatars[name]
    }
    // If this is the current user and they have a profile image, use it
    if (name === userName && userProfileImage) {
      return userProfileImage
    }
    // Otherwise, generate avatar from username
    return getAvatarUrl(name)
  }

  // Fetch user profile images for all users in messages
  const fetchUserProfileImages = async (usernames: string[]) => {
    const uniqueUsernames = [...new Set(usernames)]
    const avatarMap: {[key: string]: string} = {}
    
    // Add current user's profile image if available
    if (userProfileImage) {
      avatarMap[userName] = userProfileImage
    }
    
    // Fetch profile images for other users
    for (const username of uniqueUsernames) {
      if (username === userName) continue
      if (avatarMap[username]) continue
      
      // Skip invalid usernames, empty usernames, or test users
      if (!username || username.trim() === '' || username.toLowerCase().includes('test')) {
        continue
      }
      
      try {
        const response = await fetch(`${baseUrl}/api/auth/user/${encodeURIComponent(username)}`)
        if (response.ok) {
          const userData = await response.json()
          if (userData.profileImage) {
            avatarMap[username] = userData.profileImage
          }
        }
        // Silently ignore 404 errors
      } catch (error) {
        // Silently ignore network errors
      }
    }
    
    setUserAvatars(prev => ({ ...prev, ...avatarMap }))
  }

  // Handle profile image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // If profile image fails to load, fall back to generated avatar
    if (e.currentTarget.src === userProfileImage) {
      e.currentTarget.src = getAvatarUrl(userName)
    }
  }

  const handleSignOut = () => {
    // Clear session storage
    sessionStorage.removeItem('chatUser')
    sessionStorage.removeItem('userInfo')
    sessionStorage.removeItem('userGroup')
    sessionStorage.removeItem('adminGroup')
    
    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect()
    }
    
    // Redirect to appropriate page
    const redirectPath = userGroup === 'admins'
      ? '/admin/login'
      : userGroup === 'cepier'
        ? '/chat'
      : userGroup === 'choir'
        ? '/choir'
        : `/${userGroup}`
    navigate(redirectPath)
  }

  const handleSettings = () => {
    // For now, just show a notification
    showNotification('Settings feature coming soon!', 'info')
    setShowProfileDropdown(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileDropdown) {
        const target = event.target as HTMLElement
        if (!target.closest('.profile-dropdown')) {
          setShowProfileDropdown(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showProfileDropdown])

  useEffect(() => {
    if (!userName) return

    // Check voice recording support
    const checkVoiceSupport = () => {
      // Check secure context (allow development networks)
      const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
      const isDevelopmentNetwork = location.hostname.startsWith('10.') || location.hostname.startsWith('192.168.') || location.hostname.startsWith('172.')
      const isDevelopmentPort = location.port === '5173' || location.port === '3000' || location.port === '8080'
      const isSecure = window.isSecureContext || isLocalhost || isDevelopmentNetwork || isDevelopmentPort
      
      // Safe API detection with error handling
      let hasMediaDevices = false
      let hasGetUserMedia = false
      let hasLegacyGetUserMedia = false
      let hasAnyGetUserMedia = false
      let hasMediaRecorder = false
      let userAgent = 'Unknown'
      
      try {
        hasMediaDevices = !!navigator.mediaDevices
        hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
        hasLegacyGetUserMedia = !!navigator.getUserMedia
        hasAnyGetUserMedia = hasMediaDevices || hasLegacyGetUserMedia
        hasMediaRecorder = !!window.MediaRecorder
        userAgent = navigator.userAgent
      } catch (error) {
        console.log('🔒 Navigator access blocked in useEffect:', error)
        // Try alternative access methods
        try {
          hasMediaRecorder = !!window.MediaRecorder
          userAgent = (window as any).navigator?.userAgent || 'Unknown'
        } catch (altError) {
          console.log('🔒 Alternative navigator access also blocked:', altError)
        }
      }
      
      // Always enable voice recording - let error handling deal with unsupported browsers
      setIsVoiceSupported(true)
      
      // Log browser capabilities for debugging
      const capabilities = {
        isSecure,
        isLocalhost,
        isDevelopmentNetwork,
        isDevelopmentPort,
        hasMediaDevices,
        hasGetUserMedia,
        hasLegacyGetUserMedia,
        hasAnyGetUserMedia,
        hasMediaRecorder,
        userAgent,
        protocol: location.protocol,
        hostname: location.hostname,
        port: location.port,
        // Additional debugging info
        navigatorBlocked: !hasMediaDevices && !hasLegacyGetUserMedia,
        alternativeAccess: hasMediaRecorder && !hasAnyGetUserMedia
      }
      
      console.log('🎤 Voice recording capabilities:', capabilities)
      console.log('🎤 Voice recording enabled:', true)
    }
    
    checkVoiceSupport()

    // Socket.IO handles protocol upgrade automatically
    socketRef.current = io(baseUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })

    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current?.id)
      console.log('User group:', userGroup)
      console.log('Room name:', roomName)
      
      // Set username and group for tracking online users
      if (userName) {
        socketRef.current.emit('set-username', { username: userName, group: userGroup })
      }
      
      // Join the group-specific chat room
      socketRef.current.emit('join-room', roomName)
    })

    socketRef.current.on('receive-message', (message: any) => {
      const messageWithAvatar = {
        ...message,
        // Use provided avatar or generate fallback
        avatar: message.avatar || getUserAvatarUrl(message.user)
      }
      setMessages(prev => [...prev, messageWithAvatar])
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    })

    socketRef.current.on('user-typing', (data: { user: string; isTyping: boolean }) => {
      if (data.user !== userName) {
        setTypingUsers(prev => data.isTyping ? (prev.includes(data.user) ? prev : [...prev, data.user]) : prev.filter(u => u !== data.user))
      }
    })

    socketRef.current.on('online-users-updated', (onlineUsersList: { name: string; isOnline: boolean; avatar?: string }[]) => {
      console.log('Online users updated:', onlineUsersList)
      const usersWithAvatars = onlineUsersList.map(u => {
        // Store in user avatars map if we got a profile image
        if (u.avatar) {
          setUserAvatars(prev => ({ ...prev, [u.name]: u.avatar! }))
        }
        return {
          name: u.name,
          avatar: u.avatar || getUserAvatarUrl(u.name),
          isOnline: true
        }
      })
      setOnlineUsers(usersWithAvatars)
    })

    socketRef.current.on('user-joined', (data: { user: string }) => {
      showNotification(`${data.user} joined the chat`, 'info')
    })

    socketRef.current.on('user-left', (data: { user: string }) => {
      showNotification(`${data.user} left the chat`, 'info')
    })

    // Load previous messages for this group
    fetch(`${baseUrl}/api/chat/messages?group=${userGroup}`)
      .then(r => r.json())
      .then(data => {
        const messagesWithAvatars = (data.messages || []).map((msg: any) => ({
          ...msg,
          avatar: msg.avatar || getUserAvatarUrl(msg.user)
        }))
        setMessages(messagesWithAvatars)
        
        // Fetch profile images for all users in messages
        const allUsernames: string[] = messagesWithAvatars.map((m: Message) => m.user as string)
        const uniqueUsernames = [...new Set(allUsernames)]
        fetchUserProfileImages(uniqueUsernames)
      })
      .catch(() => {})

    return () => { 
      socketRef.current?.emit('leaveGroup', { group: userGroup, user: userName })
      socketRef.current?.disconnect()
      
      // Cleanup recording timer
      if (recordingTimer) {
        clearInterval(recordingTimer)
      }
      
      // Stop any ongoing recording
      if (mediaRecorder && isRecording) {
        mediaRecorder.stop()
      }
    }
  }, [baseUrl, userName, userGroup, roomName])

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !userName) return
    
    const tempId = Date.now()
    const msg = { 
      id: tempId, 
      user: userName, 
      message: newMessage.trim(), 
      timestamp: new Date(),
      avatar: getUserAvatarUrl(userName),
      status: 'sending' as const
    }
    
    // Add message immediately with sending status
    setMessages(prev => [...prev, msg])
    setNewMessage('')
    setIsTyping(false)
    socketRef.current?.emit('user-typing', { user: userName, isTyping: false, room: roomName, group: userGroup })
    
    // Emit to socket with group
    console.log('Sending message via Socket.IO:', msg, 'Group:', userGroup)
    socketRef.current?.emit('send-message', {
      ...msg,
      status: 'sent',
      room: roomName,
      group: userGroup
    })
    
    // Simulate delivery and read status updates
    setTimeout(() => {
      setMessages(prev => prev.map(m => 
        m.id === tempId ? { ...m, status: 'delivered' as const } : m
      ))
    }, 1000)
    
        setTimeout(() => {
          setMessages(prev => prev.map(m => 
            m.id === tempId ? { ...m, status: 'read' as const } : m
          ))
        }, 2000)

        // Show WhatsApp-style notification
        showNotification('Message sent', 'success')
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    const hasText = !!e.target.value.trim()
    if (hasText !== isTyping) {
      setIsTyping(hasText)
      socketRef.current?.emit('user-typing', { user: userName, isTyping: hasText, room: roomName, group: userGroup })
    }
  }

  const formatTime = (timestamp: Date | string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (timestamp: Date | string) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const renderMessageStatus = (status?: string) => {
    switch (status) {
      case 'sending':
        return <span className="text-gray-400 text-xs">⏳</span>
      case 'sent':
        return <span className="text-gray-400 text-xs">✓</span>
      case 'delivered':
        return <span className="text-gray-400 text-xs">✓✓</span>
      case 'read':
        return <span className="text-blue-500 text-xs">✓✓</span>
      default:
        return <span className="text-gray-400 text-xs">✓✓</span>
    }
  }

  const startRecording = async () => {
    try {
      console.log('🎤 Starting voice recording...')
      
      // Check if we're in a secure context (HTTPS, localhost, or development network)
      const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
      const isDevelopmentNetwork = location.hostname.startsWith('10.') || location.hostname.startsWith('192.168.') || location.hostname.startsWith('172.')
      const isDevelopmentPort = location.port === '5173' || location.port === '3000' || location.port === '8080'
      const isSecureContext = window.isSecureContext || isLocalhost || isDevelopmentNetwork || isDevelopmentPort
      
      console.log('🔒 Security context check:', {
        isSecureContext: window.isSecureContext,
        isLocalhost,
        isDevelopmentNetwork,
        isDevelopmentPort,
        finalSecureContext: isSecureContext,
        protocol: location.protocol,
        hostname: location.hostname,
        port: location.port,
        origin: location.origin
      })
      
      if (!isSecureContext) {
        showNotification('Voice recording requires HTTPS. Please use the secure version of this site.', 'error')
        return
      }

      // Request microphone permission with fallbacks
      let stream: MediaStream | undefined
      
      // Safe API detection with error handling
      let hasMediaDevices = false
      let hasGetUserMedia = false
      let hasLegacyGetUserMedia = false
      let navigatorKeys: string[] = []
      let mediaDevicesKeys: string[] = []
      
      try {
        hasMediaDevices = !!navigator.mediaDevices
        hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
        hasLegacyGetUserMedia = !!navigator.getUserMedia
        navigatorKeys = Object.keys(navigator)
        mediaDevicesKeys = navigator.mediaDevices ? Object.keys(navigator.mediaDevices) : []
      } catch (error) {
        console.log('🔒 Navigator access blocked:', error)
      }
      
      console.log('🎤 API detection:', {
        hasMediaDevices,
        hasGetUserMedia,
        hasLegacyGetUserMedia,
        hasMediaRecorder: !!window.MediaRecorder,
        navigatorKeys,
        mediaDevicesKeys,
        // Test if we can at least call the functions
        canCallGetUserMedia: typeof navigator.mediaDevices?.getUserMedia === 'function',
        canCallLegacyGetUserMedia: typeof navigator.getUserMedia === 'function',
        canCreateMediaRecorder: typeof window.MediaRecorder === 'function',
        // Additional security checks
        isSecureContext: window.isSecureContext,
        protocol: location.protocol,
        hostname: location.hostname
      })
      
      if (hasMediaDevices && hasGetUserMedia) {
        // Use modern MediaDevices API
        console.log('🎤 Using modern MediaDevices API')
        try {
          // Try with advanced audio settings first
          console.log('🎤 Requesting microphone with advanced settings...')
          stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            } 
          })
          console.log('🎤 Microphone access granted with advanced settings')
        } catch (advancedError) {
          console.log('🎤 Advanced settings failed, trying basic settings...')
          try {
            // Fallback to basic audio settings
            stream = await navigator.mediaDevices.getUserMedia({ 
              audio: true
            })
            console.log('🎤 Microphone access granted with basic settings')
          } catch (basicError) {
            console.log('🎤 Basic settings failed, trying minimal settings...')
            // Final fallback - let browser choose
            stream = await navigator.mediaDevices.getUserMedia({ 
              audio: {}
            })
            console.log('🎤 Microphone access granted with minimal settings')
          }
        }
      } else if (hasLegacyGetUserMedia && navigator.getUserMedia) {
        // Use legacy getUserMedia API
        console.log('🎤 Using legacy getUserMedia API')
        stream = await new Promise<MediaStream>((resolve, reject) => {
          navigator.getUserMedia!({ audio: true }, resolve, reject)
        })
        console.log('🎤 Legacy microphone access granted')
      } else {
        // Try alternative approaches for microphone access
        console.log('❌ Standard microphone APIs not available, trying alternatives...')
        
        // Provide detailed browser information
        const browserInfo = {
          userAgent: navigator.userAgent,
          isChrome: navigator.userAgent.includes('Chrome') && !navigator.userAgent.includes('Edge'),
          isFirefox: navigator.userAgent.includes('Firefox'),
          isSafari: navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome'),
          isEdge: navigator.userAgent.includes('Edge') || navigator.userAgent.includes('Edg'),
          protocol: location.protocol,
          hostname: location.hostname
        }
        
        console.log('🌐 Browser information:', browserInfo)
        
        // Try to access microphone through different methods
        let alternativeStream: MediaStream | null = null
        
        try {
          // Check if we can at least create a MediaRecorder
          if (window.MediaRecorder) {
            console.log('🎤 MediaRecorder is available, but no getUserMedia')
            
            // Try alternative approaches
            console.log('🎤 Attempting alternative microphone access methods...')
            
            try {
              // Try accessing through window.navigator
              if ((window as any).navigator && (window as any).navigator.mediaDevices) {
                console.log('🎤 Found alternative navigator path')
                alternativeStream = await (window as any).navigator.mediaDevices.getUserMedia({ audio: true })
              }
            } catch (altError) {
              console.log('🎤 Alternative navigator path failed:', altError)
            }
            
            // Chrome/Edge specific: Try to access microphone through a different approach
            if (!alternativeStream && (browserInfo.isChrome || browserInfo.isEdge)) {
              try {
                console.log('🎤 Chrome/Edge: Trying direct microphone access...')
                
                // Try to access microphone through a more direct method for Chrome/Edge
                const chromeEdgeAccess = async () => {
                  // Try to access through window.navigator.mediaDevices with Chrome/Edge specific settings
                  const mediaDevices = (window as any).navigator?.mediaDevices
                  if (mediaDevices && mediaDevices.getUserMedia) {
                    console.log('🎤 Chrome/Edge: Found mediaDevices, trying Chrome/Edge specific settings...')
                    return await mediaDevices.getUserMedia({ 
                      audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                        sampleRate: 44100,
                        channelCount: 1
                      }
                    })
                  }
                  
                  // Try legacy approach for Chrome/Edge
                  if ((window as any).navigator?.getUserMedia) {
                    console.log('🎤 Chrome/Edge: Trying legacy getUserMedia...')
                    return new Promise<MediaStream>((resolve, reject) => {
                      (window as any).navigator.getUserMedia({ audio: true }, resolve, reject)
                    })
                  }
                  
                  throw new Error('No Chrome/Edge microphone access methods available')
                }
                
                alternativeStream = await chromeEdgeAccess()
                console.log('🎤 Chrome/Edge: Direct microphone access successful!')
              } catch (chromeEdgeError) {
                console.log('🎤 Chrome/Edge: Direct microphone access failed:', chromeEdgeError)
              }
            }
            
            // Method 2: Try direct microphone access through different approaches
            if (!alternativeStream) {
              try {
                console.log('🎤 Attempting direct microphone access...')
                
                // Try multiple approaches to get microphone access
                const approaches = [
                  // Approach 1: Chrome/Edge specific - Try through window.navigator.mediaDevices with explicit permissions
                  async () => {
                    console.log('🎤 Chrome/Edge: Trying modern MediaDevices API...')
                    if ((window as any).navigator?.mediaDevices?.getUserMedia) {
                      return await (window as any).navigator.mediaDevices.getUserMedia({ 
                        audio: {
                          echoCancellation: true,
                          noiseSuppression: true,
                          autoGainControl: true,
                          sampleRate: 44100
                        }
                      })
                    }
                    throw new Error('Modern MediaDevices API not available')
                  },
                  // Approach 2: Chrome/Edge specific - Try with basic audio constraints
                  async () => {
                    console.log('🎤 Chrome/Edge: Trying basic audio constraints...')
                    if ((window as any).navigator?.mediaDevices?.getUserMedia) {
                      return await (window as any).navigator.mediaDevices.getUserMedia({ 
                        audio: true
                      })
                    }
                    throw new Error('Basic MediaDevices API not available')
                  },
                  // Approach 3: Chrome/Edge specific - Try with minimal constraints
                  async () => {
                    console.log('🎤 Chrome/Edge: Trying minimal constraints...')
                    if ((window as any).navigator?.mediaDevices?.getUserMedia) {
                      return await (window as any).navigator.mediaDevices.getUserMedia({ 
                        audio: {}
                      })
                    }
                    throw new Error('Minimal MediaDevices API not available')
                  },
                  // Approach 4: Legacy Chrome/Edge - Try through navigator.getUserMedia
                  () => new Promise<MediaStream>((resolve, reject) => {
                    console.log('🎤 Chrome/Edge: Trying legacy getUserMedia...')
                    if ((window as any).navigator?.getUserMedia) {
                      (window as any).navigator.getUserMedia({ audio: true }, resolve, reject)
                    } else {
                      reject(new Error('Legacy getUserMedia not available'))
                    }
                  }),
                  // Approach 5: Chrome/Edge specific - Try through webkitGetUserMedia
                  () => new Promise<MediaStream>((resolve, reject) => {
                    console.log('🎤 Chrome/Edge: Trying webkitGetUserMedia...')
                    if ((window as any).navigator?.webkitGetUserMedia) {
                      (window as any).navigator.webkitGetUserMedia({ audio: true }, resolve, reject)
                    } else {
                      reject(new Error('webkitGetUserMedia not available'))
                    }
                  }),
                  // Approach 6: Chrome/Edge specific - Try through mozGetUserMedia (Edge)
                  () => new Promise<MediaStream>((resolve, reject) => {
                    console.log('🎤 Chrome/Edge: Trying mozGetUserMedia...')
                    if ((window as any).navigator?.mozGetUserMedia) {
                      (window as any).navigator.mozGetUserMedia({ audio: true }, resolve, reject)
                    } else {
                      reject(new Error('mozGetUserMedia not available'))
                    }
                  })
                ]
                
                // Try each approach
                for (let i = 0; i < approaches.length; i++) {
                  try {
                    console.log(`🎤 Trying approach ${i + 1}...`)
                    alternativeStream = await approaches[i]()
                    console.log(`🎤 Approach ${i + 1} successful!`)
                    console.log(`🎤 Stream obtained:`, alternativeStream)
                    break
                  } catch (error) {
                    console.log(`🎤 Approach ${i + 1} failed:`, error)
                  }
                }
                
                console.log(`🎤 Final alternativeStream check:`, !!alternativeStream)
                
                if (!alternativeStream) {
                  console.log('🎤 All direct approaches failed, trying MediaRecorder workaround...')
                  
                  // Final approach: Create a MediaRecorder with a dummy stream
                  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
                  const oscillator = audioContext.createOscillator()
                  const gainNode = audioContext.createGain()
                  const destination = audioContext.createMediaStreamDestination()
                  
                  oscillator.connect(gainNode)
                  gainNode.connect(destination)
                  gainNode.gain.value = 0 // Silent
                  oscillator.start()
                  
                  // Create a MediaRecorder with the silent stream
                  const recorder = new MediaRecorder(destination.stream)
                  console.log('🎤 MediaRecorder created with silent stream')
                  
                  // This is just to test if MediaRecorder works
                  showNotification('MediaRecorder is available but microphone access is blocked. Please check your browser permissions and ensure you\'re using HTTPS.', 'error')
                  return
                }
              } catch (recorderError) {
                console.log('🎤 All microphone access methods failed:', recorderError)
              }
            }
            
            console.log(`🎤 Before stream assignment - alternativeStream:`, !!alternativeStream)
            console.log(`🎤 Before stream assignment - stream:`, !!stream)
            
            if (alternativeStream) {
              stream = alternativeStream
              console.log('🎤 Alternative microphone access successful!')
              console.log(`🎤 Stream assigned successfully:`, !!stream)
            } else {
              // Try one more direct approach - force microphone access
              try {
                console.log('🎤 Attempting forced microphone access...')
                
                // Try to access microphone through a more direct method
                const directAccess = async () => {
                  // First, try to request permission explicitly
                  try {
                    console.log('🎤 Requesting microphone permission...')
                    
                    // Try to access through window.navigator.mediaDevices with explicit permission
                    const mediaDevices = (window as any).navigator?.mediaDevices
                    if (mediaDevices && mediaDevices.getUserMedia) {
                      console.log('🎤 Found mediaDevices, requesting permission...')
                      return await mediaDevices.getUserMedia({ 
                        audio: {
                          echoCancellation: true,
                          noiseSuppression: true,
                          autoGainControl: true
                        }
                      })
                    }
                  } catch (permissionError) {
                    console.log('🎤 Permission request failed:', permissionError)
                  }
                  
                  // Try legacy approach with explicit permission
                  try {
                    if ((window as any).navigator?.getUserMedia) {
                      console.log('🎤 Trying legacy getUserMedia...')
                      return new Promise<MediaStream>((resolve, reject) => {
                        (window as any).navigator.getUserMedia({ audio: true }, resolve, reject)
                      })
                    }
                  } catch (legacyError) {
                    console.log('🎤 Legacy getUserMedia failed:', legacyError)
                  }
                  
                  // Try webkit approach (Safari)
                  try {
                    if ((window as any).navigator?.webkitGetUserMedia) {
                      console.log('🎤 Trying webkitGetUserMedia...')
                      return new Promise<MediaStream>((resolve, reject) => {
                        (window as any).navigator.webkitGetUserMedia({ audio: true }, resolve, reject)
                      })
                    }
                  } catch (webkitError) {
                    console.log('🎤 webkitGetUserMedia failed:', webkitError)
                  }
                  
                  // Try moz approach (Firefox)
                  try {
                    if ((window as any).navigator?.mozGetUserMedia) {
                      console.log('🎤 Trying mozGetUserMedia...')
                      return new Promise<MediaStream>((resolve, reject) => {
                        (window as any).navigator.mozGetUserMedia({ audio: true }, resolve, reject)
                      })
                    }
                  } catch (mozError) {
                    console.log('🎤 mozGetUserMedia failed:', mozError)
                  }
                  
                  throw new Error('No microphone access methods available')
                }
                
                alternativeStream = await directAccess()
                if (alternativeStream) {
                  stream = alternativeStream
                  console.log('🎤 Forced microphone access successful!')
                } else {
                  // Final attempt: Try to access microphone through a different approach
                  console.log('🎤 Final attempt: Trying to access microphone through different approach...')
                  
                  try {
                    // Try to access microphone through a different approach
                    const finalAttempt = async () => {
                      // Try to access through window.navigator.mediaDevices with different parameters
                      const mediaDevices = (window as any).navigator?.mediaDevices
                      if (mediaDevices && mediaDevices.getUserMedia) {
                        console.log('🎤 Final attempt: Found mediaDevices, trying different parameters...')
                        return await mediaDevices.getUserMedia({ 
                          audio: true // Use basic audio without constraints
                        })
                      }
                      
                      // Try legacy approach with different parameters
                      if ((window as any).navigator?.getUserMedia) {
                        console.log('🎤 Final attempt: Trying legacy getUserMedia with basic parameters...')
                        return new Promise<MediaStream>((resolve, reject) => {
                          (window as any).navigator.getUserMedia({ audio: true }, resolve, reject)
                        })
                      }
                      
                      throw new Error('No microphone access methods available')
                    }
                    
                    alternativeStream = await finalAttempt()
                    if (alternativeStream) {
                      stream = alternativeStream
                      console.log('🎤 Final attempt successful!')
                    }
                  } catch (finalError) {
                    console.log('🎤 Final attempt failed:', finalError)
                  }
                }
              } catch (forcedError) {
                console.log('🎤 Forced microphone access failed:', forcedError)
                
                // Provide specific guidance based on browser
                if (browserInfo.isChrome) {
                  showNotification('Chrome: Please click the microphone icon in the address bar and allow microphone access. Also ensure you\'re using HTTPS or localhost. Try refreshing the page.', 'error')
                } else if (browserInfo.isEdge) {
                  showNotification('Edge: Please click the microphone icon in the address bar and allow microphone access. Also ensure you\'re using HTTPS or localhost. Try refreshing the page.', 'error')
                } else if (browserInfo.isFirefox) {
                  showNotification('Firefox: Please allow microphone permissions and ensure you\'re using HTTPS or localhost. Try refreshing the page.', 'error')
                } else if (browserInfo.isSafari) {
                  showNotification('Safari: Please allow microphone permissions and ensure you\'re using HTTPS or localhost. Try refreshing the page.', 'error')
                } else {
                  showNotification('Microphone access is blocked. Please check your browser permissions, ensure you\'re using HTTPS, and try refreshing the page.', 'error')
                }
                return
              }
            }
          } else {
            console.log('❌ MediaRecorder not available')
            showNotification('Voice recording is not supported in this browser. Please use Chrome, Firefox, or Safari.', 'error')
            return
          }
        } catch (alternativeError) {
          console.log('❌ All microphone access methods failed:', alternativeError)
          showNotification('Microphone access is not available. Please check your browser settings and try a different browser.', 'error')
          return
        }
      }
      
      // Try different MIME types for better compatibility
      // Check if stream is available
      if (!stream) {
        console.error('🎤 No stream available')
        showNotification('Unable to access microphone. Please check permissions.', 'error')
        return
      }

      let mimeType = 'audio/webm'
      let recorder: MediaRecorder | undefined
      
      console.log('🎤 Setting up MediaRecorder...')
      
      try {
        // Prefer the most widely supported format
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          console.log('🎤 Using WebM codec (most compatible)')
          recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
          mimeType = 'audio/webm'
        } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          console.log('🎤 Using WebM/Opus codec')
          recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
          mimeType = 'audio/webm;codecs=opus'
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          console.log('🎤 Using MP4 codec')
          recorder = new MediaRecorder(stream, { mimeType: 'audio/mp4' })
          mimeType = 'audio/mp4'
        } else {
          console.log('🎤 Using browser default codec')
          // Let browser choose the best format
          recorder = new MediaRecorder(stream)
        }
        console.log('🎤 MediaRecorder created successfully with mimeType:', recorder.mimeType)
      } catch (recorderError) {
        console.log('🎤 MediaRecorder creation failed, using fallback')
        // Fallback to basic MediaRecorder
        recorder = new MediaRecorder(stream)
      }
      
      if (!recorder) {
        console.error('🎤 No recorder available')
        showNotification('Unable to create recorder. Please try again.', 'error')
        return
      }

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data])
        }
      }
      
      recorder.onstop = () => {
        // Use the MIME type from the recorder
        const blobType = recorder.mimeType || 'audio/webm'
        console.log('Using MIME type for blob:', blobType)
        const audioBlob = new Blob(audioChunks, { type: blobType })
        
        // Calculate actual recording duration
        const actualDuration = recordingStartTime ? (Date.now() - recordingStartTime) / 1000 : recordingDuration
        
        // Ensure minimum display duration of 0.1 seconds for very short recordings
        const displayDuration = Math.max(actualDuration, 0.1)
        
        // Send voice note regardless of duration
        sendVoiceNote(audioBlob, displayDuration)
        
        if (stream) {
          stream.getTracks().forEach(track => track.stop())
        }
      }
      
      recorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        showNotification('Recording error occurred. Please try again.', 'error')
        setIsRecording(false)
        if (stream) {
          stream.getTracks().forEach(track => track.stop())
        }
      }
      
      console.log('🎤 Starting recording...')
      recorder.start(100) // Collect data every 100ms for better responsiveness
      setMediaRecorder(recorder)
      setIsRecording(true)
      setRecordingDuration(0)
      setAudioChunks([])
      setRecordingStartTime(Date.now())
      
      // Start timer (update every 100ms for better visual feedback)
      const timer = setInterval(() => {
        setRecordingDuration(prev => prev + 0.1)
      }, 100)
      setRecordingTimer(timer)
      
      console.log('🎤 Recording started successfully!')
      
    } catch (error) {
      console.error('Error starting recording:', error)
      
      // Debug information
      console.log('Browser compatibility check:', {
        isSecureContext: window.isSecureContext,
        protocol: location.protocol,
        hostname: location.hostname,
        port: location.port,
        isLocalhost: location.hostname === 'localhost' || location.hostname === '127.0.0.1',
        isDevelopmentNetwork: location.hostname.startsWith('10.') || location.hostname.startsWith('192.168.') || location.hostname.startsWith('172.'),
        isDevelopmentPort: location.port === '5173' || location.port === '3000' || location.port === '8080',
        hasNavigator: !!navigator,
        hasMediaDevices: !!navigator.mediaDevices,
        hasGetUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        hasLegacyGetUserMedia: !!navigator.getUserMedia,
        hasAnyGetUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) || !!navigator.getUserMedia,
        hasMediaRecorder: !!window.MediaRecorder
      })
      
      const err = error as any
      if (err.name === 'NotAllowedError') {
        showNotification('Please allow microphone access to record voice notes.', 'error')
      } else if (err.name === 'NotFoundError') {
        showNotification('No microphone detected. Please connect a microphone.', 'error')
      } else if (err.message && err.message.includes('getUserMedia')) {
        showNotification('Microphone access is not available. Please check your browser settings and try again.', 'error')
      } else {
        showNotification('Unable to start recording. Please try again.', 'error')
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      try {
        mediaRecorder.stop()
        setIsRecording(false)
        setIsPressingMic(false)
        if (recordingTimer) {
          clearInterval(recordingTimer)
          setRecordingTimer(null)
        }
        setRecordingStartTime(null)
      } catch (error) {
        console.error('Error stopping recording:', error)
        showNotification('Error stopping recording. Please try again.', 'error')
        setIsRecording(false)
        setIsPressingMic(false)
        if (recordingTimer) {
          clearInterval(recordingTimer)
          setRecordingTimer(null)
        }
        setRecordingStartTime(null)
      }
    }
  }

  // WhatsApp-style press and hold handlers
  const handleMicPress = async (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setIsPressingMic(true)
    await startRecording()
  }

  const handleMicRelease = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (isRecording) {
      stopRecording()
    }
    setIsPressingMic(false)
  }

  const handleMicCancel = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (isRecording) {
      cancelRecording()
    }
    setIsPressingMic(false)
  }

  const cancelRecording = () => {
    if (mediaRecorder && isRecording) {
      try {
        mediaRecorder.stop()
        setIsRecording(false)
        setIsPressingMic(false)
        setRecordingDuration(0)
        setAudioChunks([])
        setRecordingStartTime(null)
        if (recordingTimer) {
          clearInterval(recordingTimer)
          setRecordingTimer(null)
        }
        showNotification('Recording cancelled.', 'info')
      } catch (error) {
        console.error('Error cancelling recording:', error)
        showNotification('Error cancelling recording.', 'error')
        setIsRecording(false)
        setIsPressingMic(false)
        setRecordingDuration(0)
        setAudioChunks([])
        setRecordingStartTime(null)
        if (recordingTimer) {
          clearInterval(recordingTimer)
          setRecordingTimer(null)
        }
      }
    }
  }

  const sendVoiceNote = async (audioBlob: Blob, duration: number) => {
    if (!userName) return
    
    const tempId = Date.now()
    
    // Detect MIME type from blob
    const mimeType = audioBlob.type || 'audio/webm'
    console.log('Voice note MIME type:', mimeType)
    console.log('Blob properties:', {
      type: audioBlob.type,
      size: audioBlob.size,
      duration: duration
    })
    
    // Convert blob to base64 for storage
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64Audio = reader.result as string
      
      // Create temporary voice note message
      const voiceMessage = {
        id: tempId,
        user: userName,
        message: '',
        timestamp: new Date(),
        avatar: getUserAvatarUrl(userName),
        type: 'voice' as const,
        status: 'sending' as const,
        voiceNote: {
          url: base64Audio, // Store as base64
          duration: duration,
          mimeType: mimeType, // Include MIME type for proper playback
          waveform: generateWaveform(audioBlob)
        }
      }
      
      console.log('Voice message created:', voiceMessage)
      
      // Add message immediately
      setMessages(prev => [...prev, voiceMessage])
      
      // Show success notification
      showNotification('Voice note sent!', 'success')
      
      // Upload to server (simulate for now)
      setTimeout(() => {
        setMessages(prev => prev.map(m => 
          m.id === tempId ? { ...m, status: 'sent' as const } : m
        ))
      }, 1000)
      
      setTimeout(() => {
        setMessages(prev => prev.map(m => 
          m.id === tempId ? { ...m, status: 'delivered' as const } : m
        ))
      }, 2000)
      
      setTimeout(() => {
        setMessages(prev => prev.map(m => 
          m.id === tempId ? { ...m, status: 'read' as const } : m
        ))
      }, 3000)
    }
    
    reader.readAsDataURL(audioBlob)
  }

  const generateWaveform = (audioBlob: Blob): number[] => {
    // Generate a simple waveform visualization
    const waveform = []
    for (let i = 0; i < 50; i++) {
      waveform.push(Math.random() * 100)
    }
    return waveform
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string, mimeType: string) => {
    switch (fileType) {
      case 'image':
        return '🖼️'
      case 'video':
        return '🎥'
      case 'audio':
        return '🎵'
      case 'document':
        if (mimeType.includes('pdf')) return '📄'
        if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
        if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📽️'
        if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return '📦'
        return '📄'
      default:
        return '📎'
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      uploadFile(file)
    }
  }

  const uploadFile = async (file: File) => {
    if (!userName) return

    setIsUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('file', file)

    console.log('Uploading file:', file.name, file.type, file.size)

    try {
      const response = await fetch(`${baseUrl}/api/chat/upload`, {
        method: 'POST',
        body: formData
      })

      console.log('Upload response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Upload failed:', errorText)
        throw new Error('Upload failed: ' + errorText)
      }

      const result = await response.json()
      console.log('Upload result:', result)
      console.log('File attachment received:', result.fileAttachment)
      
      if (result.success) {
        const tempId = Date.now()
        const fileMessage = {
          id: tempId,
          user: userName,
          message: '',
          timestamp: new Date(),
          avatar: getUserAvatarUrl(userName),
          type: 'file' as const,
          status: 'sending' as const,
          fileAttachment: result.fileAttachment
        }

        console.log('File message created:', fileMessage)
        console.log('Sending file message via Socket.IO:', fileMessage)

        // Add message immediately to show in chat
        setMessages(prev => [...prev, fileMessage])

        // Emit to socket
        socketRef.current?.emit('send-message', {
          ...fileMessage,
          status: 'sent',
          room: roomName,
          group: userGroup
        })

        // Show WhatsApp-style notification
        showNotification('File sent', 'success')
      } else {
        throw new Error(result.message || 'Upload failed')
      }
    } catch (error) {
      console.error('File upload error:', error)
      showNotification('Failed to upload file. Please try again.', 'error')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      setSelectedFile(null)
    }
  }

  const openFilePicker = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setSelectedFile(file)
        uploadFile(file)
      }
    }
    input.click()
  }

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type })
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }


  const FileAttachment = ({ fileAttachment, isOwn }: { fileAttachment: any, isOwn: boolean }) => {
    // If no file attachment, return null
    if (!fileAttachment) {
      return null
    }
    
    const [isDownloading, setIsDownloading] = useState(false)
    const [downloadProgress, setDownloadProgress] = useState(0)
    const fileId = `${fileAttachment.fileName}-${fileAttachment.fileSize}`

    const handleDownload = async () => {
      if (isDownloading) return

      setIsDownloading(true)
      setDownloadProgress(0)
      
      // Add to downloading files set
      setDownloadingFiles(prev => new Set([...prev, fileId]))

      try {
        // Show download started notification
        showNotification(`Downloading ${fileAttachment.fileName}...`, 'info')

        // Create download link with progress tracking
        const response = await fetch(fileAttachment.fileUrl)
        
        if (!response.ok) {
          throw new Error('Download failed')
        }

        const contentLength = response.headers.get('content-length')
        const total = contentLength ? parseInt(contentLength, 10) : 0
        const reader = response.body?.getReader()
        
        if (!reader) {
          throw new Error('No response body')
        }

        const chunks: Uint8Array[] = []
        let receivedLength = 0

        while (true) {
          const { done, value } = await reader.read()
          
          if (done) break
          
          chunks.push(value)
          receivedLength += value.length
          
          if (total > 0) {
            const progress = Math.round((receivedLength / total) * 100)
            setDownloadProgress(progress)
          }
        }

        // Create blob and download
        const blob = new Blob(chunks as any[])
        const url = window.URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = fileAttachment.fileName
        link.style.display = 'none'
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Cleanup
        window.URL.revokeObjectURL(url)
        
        // Show success notification
        showNotification(`${fileAttachment.fileName} downloaded successfully`, 'success')
        
      } catch (error) {
        console.error('Download error:', error)
        showNotification(`Failed to download ${fileAttachment.fileName}`, 'error')
      } finally {
        setIsDownloading(false)
        setDownloadProgress(0)
        setDownloadingFiles(prev => {
          const newSet = new Set(prev)
          newSet.delete(fileId)
          return newSet
        })
      }
    }

    const handlePreview = () => {
      if (fileAttachment.fileType === 'image') {
        // WhatsApp-style: Open in full-screen modal
        setFullscreenImage({ url: fileAttachment.fileUrl, fileName: fileAttachment.fileName })
      } else if (fileAttachment.fileType === 'video') {
        window.open(fileAttachment.fileUrl, '_blank')
      } else {
        handleDownload()
      }
    }

    return (
      <div className="max-w-xs lg:max-w-md">
        {fileAttachment.fileType === 'image' ? (
          <div className="relative group cursor-pointer" onClick={handlePreview}>
            {/* WhatsApp-style image display: rounded corners, max width constraint */}
            <div className="relative overflow-hidden rounded-lg" style={{ maxWidth: '300px', maxHeight: '400px' }}>
              <img 
                src={fileAttachment.fileUrl} 
                alt={fileAttachment.fileName}
                className="w-full h-auto object-cover rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                style={{ maxHeight: '400px' }}
                loading="lazy"
              />
              {/* WhatsApp-style overlay on hover */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/50 rounded-full p-2">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : fileAttachment.fileType === 'video' ? (
          <div className="relative group cursor-pointer" onClick={handlePreview}>
            <video 
              src={fileAttachment.fileUrl}
              className="w-full h-auto max-h-96 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              controls
              preload="metadata"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center pointer-events-none">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          </div>
        ) : fileAttachment.fileType === 'audio' ? (
          <div className={`p-4 rounded-lg shadow-md ${
            isOwn 
              ? 'bg-green-600/20 border border-green-400/30' 
              : 'bg-white/90 border border-gray-200'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isOwn ? 'bg-green-500' : 'bg-blue-500'
                }`}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  isOwn ? 'text-white' : 'text-gray-900'
                }`}>
                  {fileAttachment.fileName}
                </p>
                <audio 
                  src={fileAttachment.fileUrl}
                  controls
                  className="w-full mt-2"
                  preload="metadata"
                >
                  Your browser does not support the audio element.
                </audio>
                <p className={`text-xs mt-1 ${
                  isOwn ? 'text-green-100' : 'text-gray-500'
                }`}>
                  {formatFileSize(fileAttachment.fileSize)}
                  {fileAttachment.duration && ` • ${formatDuration(fileAttachment.duration)}`}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div 
            className={`p-4 rounded-lg border-2 border-dashed cursor-pointer hover:bg-opacity-10 transition-colors ${
              isOwn 
                ? 'border-white/30 hover:bg-white/10' 
                : 'border-gray-300 hover:bg-gray-100'
            }`}
            onClick={handleDownload}
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">
                {getFileIcon(fileAttachment.fileType, fileAttachment.mimeType)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  isOwn ? 'text-white' : 'text-gray-900'
                }`}>
                  {fileAttachment.fileName}
                </p>
                <p className={`text-xs ${
                  isOwn ? 'text-green-100' : 'text-gray-500'
                }`}>
                  {formatFileSize(fileAttachment.fileSize)}
                </p>
              </div>
              <div className={`p-2 rounded-full ${
                isOwn 
                  ? 'bg-white/20 hover:bg-white/30' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const VoiceNotePlayer = ({ voiceNote, isOwn }: { voiceNote: any, isOwn: boolean }) => {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
      if (voiceNote?.url) {
        try {
          // Check if the URL is base64 (data URL)
          let audioUrl: string
          if (voiceNote.url.startsWith('data:')) {
            // Already a data URL
            audioUrl = voiceNote.url
          } else {
            // Need to convert base64 to data URL
            const mimeType = voiceNote.mimeType || 'audio/webm'
            
            // Check if it's already base64 or needs to be wrapped
            if (voiceNote.url.includes('base64,')) {
              // It's already a complete data URL but without the data: prefix
              audioUrl = `data:${mimeType};${voiceNote.url}`
            } else {
              audioUrl = `data:${mimeType};base64,${voiceNote.url}`
            }
          }
          
          console.log('Creating audio element with URL:', audioUrl.substring(0, 100))
          console.log('Voice note data:', {
            urlLength: voiceNote.url.length,
            mimeType: voiceNote.mimeType,
            duration: voiceNote.duration
          })
          
          const audioElement = new Audio(audioUrl)
          
          // Add error handling for unsupported formats
          audioElement.addEventListener('error', (e) => {
            console.error('Audio playback error:', e)
            console.error('Audio error details:', {
              error: audioElement.error,
              code: audioElement.error?.code,
              message: audioElement.error?.message,
              networkState: audioElement.networkState,
              readyState: audioElement.readyState,
              srcLength: audioUrl.length
            })
            setIsPlaying(false)
            // Show user-friendly error message
            showNotification('Unable to play voice note. Please check if audio format is supported.', 'error')
          })

        // Add load event to check if audio can be loaded
        audioElement.addEventListener('canplaythrough', () => {
          console.log('Audio can play through')
        })

        audioElement.addEventListener('timeupdate', () => {
          setCurrentTime(audioElement.currentTime)
          setProgress((audioElement.currentTime / voiceNote.duration) * 100)
        })

        audioElement.addEventListener('ended', () => {
          setIsPlaying(false)
          setCurrentTime(0)
          setProgress(0)
        })

        setAudio(audioElement)

        return () => {
          audioElement.pause()
          audioElement.removeEventListener('timeupdate', () => {})
          audioElement.removeEventListener('ended', () => {})
          audioElement.removeEventListener('error', () => {})
          audioElement.removeEventListener('canplaythrough', () => {})
        }
        } catch (error) {
          console.error('Error setting up audio element:', error)
          setIsPlaying(false)
          showNotification('Unable to load voice note. Audio format not supported.', 'error')
        }
      }
    }, [voiceNote])

    const togglePlayPause = async () => {
      if (audio) {
        try {
          if (isPlaying) {
            audio.pause()
            setIsPlaying(false)
          } else {
            // Check if audio is ready to play
            if (audio.readyState >= 2) { // HAVE_CURRENT_DATA or higher
              await audio.play()
              setIsPlaying(true)
            } else {
              console.log('Audio not ready, waiting for data...')
              // Wait for audio to be ready
              audio.addEventListener('canplay', async () => {
                try {
                  await audio.play()
                  setIsPlaying(true)
                } catch (playError) {
                  console.error('Error playing audio after load:', playError)
                  setIsPlaying(false)
                }
              }, { once: true })
            }
          }
        } catch (error) {
          console.error('Error playing audio:', error)
          setIsPlaying(false)
          // Show user-friendly error message
          showNotification('Unable to play voice note. Please try again.', 'error')
          // Try to reload the audio element
          if (voiceNote?.url) {
            let audioUrl: string
            if (voiceNote.url.startsWith('data:')) {
              audioUrl = voiceNote.url
            } else {
              const mimeType = voiceNote.mimeType || 'audio/webm'
              audioUrl = `data:${mimeType};base64,${voiceNote.url}`
            }
            console.log('Reloading audio element with URL:', audioUrl.substring(0, 100))
            const newAudioElement = new Audio(audioUrl)
            setAudio(newAudioElement)
          }
        }
      }
    }

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
      if (audio && voiceNote) {
        const rect = e.currentTarget.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const percentage = clickX / rect.width
        const newTime = percentage * voiceNote.duration
        audio.currentTime = newTime
        setCurrentTime(newTime)
        setProgress(percentage * 100)
      }
    }

    return (
      <div className="flex items-center space-x-3 py-2">
        <button
          onClick={togglePlayPause}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            isOwn 
              ? 'bg-white/20 hover:bg-white/30' 
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>
        
        <div className="flex-1">
          {/* WhatsApp-style waveform progress bar */}
          <div 
            className={`relative h-9 rounded-full cursor-pointer overflow-hidden ${
              isOwn ? 'bg-white/20' : 'bg-gray-200'
            }`}
            onClick={handleSeek}
          >
            {/* Progress fill */}
            <div 
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-100 ${
                isOwn ? 'bg-white/40' : 'bg-green-500'
              }`}
              style={{ width: `${progress}%` }}
            />
            
            {/* WhatsApp-style waveform visualization */}
            <div className="absolute inset-0 flex items-center justify-center space-x-0.5 px-2">
              {voiceNote?.waveform?.slice(0, 30).map((height: number, index: number) => {
                const isActive = (index / 30) * 100 < progress
                return (
                  <div
                    key={index}
                    className={`w-0.5 rounded-full transition-all duration-150 ${
                      isActive
                        ? (isOwn ? 'bg-white' : 'bg-white')
                        : (isOwn ? 'bg-white/30' : 'bg-gray-400')
                    }`}
                    style={{ 
                      height: `${Math.max(6, Math.min(20, (height / 5)))}px`,
                      transition: 'all 0.15s ease'
                    }}
                  />
                )
              }) || Array.from({ length: 30 }).map((_, index) => (
                <div
                  key={index}
                  className={`w-0.5 rounded-full ${
                    isOwn ? 'bg-white/30' : 'bg-gray-400'
                  }`}
                  style={{ height: `${6 + Math.random() * 8}px` }}
                />
              ))}
            </div>
          </div>
          
          {/* WhatsApp-style time display */}
          <div className={`flex justify-between text-xs mt-1.5 ${
            isOwn ? 'text-green-100' : 'text-gray-500'
          }`}>
            <span className="font-medium">{formatDuration(Math.floor(currentTime))}</span>
            <span className="opacity-70">{formatDuration(voiceNote?.duration || 0)}</span>
          </div>
        </div>
      </div>
    )
  }

  React.useEffect(() => {
    if (userGroup === 'admins' && !userName) {
      navigate('/admin/login')
    } else if (userGroup === 'cepier' && !userName) {
      navigate('/chat')
    }
  }, [userGroup, userName, navigate])

  if (!userName) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Missing user</h3>
            <p className="text-gray-600 mb-6">Please return to the choir page and login to chat.</p>
            <button 
              onClick={() => navigate('/choir')} 
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
            >
              Go to Choir
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-100 flex relative">
      {/* Sidebar - Hidden on mobile, visible on desktop */}
      <div className={`${showSidebar ? 'w-80' : 'w-0'} hidden lg:block bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden`}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200" style={{ backgroundColor: '#075E54' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{groupDisplayName}</h2>
              <button 
                onClick={() => setShowSidebar(false)}
                className="p-2 hover:bg-white/20 rounded-lg"
              >
                <i data-lucide="x" className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Online Users */}
          <div className="flex-1 p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Online Members ({onlineUsers.length})</h3>
            <div className="space-y-2">
              {onlineUsers.map((user) => (
                <div key={user.name} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                  <div className="relative">
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = getUserAvatarUrl(user.name)
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-green-500">Online</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200" style={{ backgroundColor: '#075E54' }}>
            <div className="flex items-center space-x-3">
              <img 
                src={getUserAvatarUrl(userName)} 
                alt={userName}
                className="w-10 h-10 rounded-full"
                onError={handleImageError}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{userName}</p>
                <p className="text-xs text-white/80">You</p>
              </div>
              <button 
                onClick={handleSignOut}
                className="p-2 hover:bg-white/20 rounded-lg"
                title="Logout"
              >
                <i data-lucide="log-out" className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="border-b border-gray-200 p-4" style={{ backgroundColor: '#075E54' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <i data-lucide="users" className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white">{groupDisplayName}</h1>
                  <p className="text-sm text-white/80">{onlineUsers.length} {userGroup === 'admins' ? 'admins online' : 'members online'}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-white/20 rounded-lg">
                <i data-lucide="phone" className="w-5 h-5 text-white" />
              </button>
              <button className="p-2 hover:bg-white/20 rounded-lg">
                <i data-lucide="video" className="w-5 h-5 text-white" />
              </button>
              
              {/* Profile Dropdown */}
              <div className="relative profile-dropdown">
                <button 
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center space-x-2 p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <img 
                    src={getUserAvatarUrl(userName)} 
                    alt={userName}
                    className="w-8 h-8 rounded-full"
                    onError={handleImageError}
                  />
                  <span className="text-sm font-medium text-white hidden sm:block">{userName}</span>
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{userName}</p>
                      <p className="text-xs text-gray-500">Online</p>
                    </div>
                    <button 
                      onClick={handleSettings}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Settings</span>
                    </button>
                    <button 
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp-style Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 transform ${
            notification.type === 'success' 
              ? 'bg-green-500 text-white' 
              : notification.type === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 text-white'
          }`}>
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                ) : notification.type === 'error' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 bg-gray-50 overflow-y-auto p-4 relative" style={chatBackgroundStyle}>
          <div className="space-y-4">
            {messages.map((msg, i) => {
              const isOwn = msg.user === userName
              const showAvatar = i === 0 || messages[i - 1].user !== msg.user
              const showDate = i === 0 || formatDate(messages[i - 1].timestamp) !== formatDate(msg.timestamp)
              
              return (
                <div key={msg.id || i}>
                  {showDate && (
                    <div className="text-center my-4">
                      <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                        {formatDate(msg.timestamp)}
                      </span>
                    </div>
                  )}
                  
                  {msg.type === 'system' ? (
                    <div className="text-center my-2">
                      <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                        {msg.message}
                      </span>
                    </div>
                  ) : msg.type === 'file' ? (
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-4' : 'mt-1'}`}>
                      {!isOwn && showAvatar && (
                        <img 
                          src={getUserAvatarUrl(msg.user)} 
                          alt={msg.user}
                          className="w-8 h-8 rounded-full mr-2 flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = getAvatarUrl(msg.user)
                          }}
                        />
                      )}
                      {!isOwn && !showAvatar && (
                        <div className="w-8 h-8 mr-2 flex-shrink-0"></div>
                      )}
                      
                      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : ''}`}>
                        {!isOwn && showAvatar && (
                          <p className="text-xs text-gray-500 mb-1 ml-1">{msg.user}</p>
                        )}
                        <div className={`px-4 py-2 rounded-lg backdrop-blur-sm relative ${
                          isOwn 
                            ? 'bg-green-500 text-white rounded-br-sm shadow-lg' 
                            : 'bg-white/90 text-gray-900 rounded-bl-sm shadow-md border border-white/20'
                        }`}>
                          {/* Message tail for file attachments */}
                          {isOwn ? (
                            <div className="absolute -right-1 bottom-0 w-0 h-0 border-l-[8px] border-l-green-500 border-t-[8px] border-t-transparent"></div>
                          ) : (
                            <div className="absolute -left-1 bottom-0 w-0 h-0 border-r-[8px] border-r-white/90 border-t-[8px] border-t-transparent"></div>
                          )}
                          
                          {/* Show message text if exists */}
                          {msg.message && (
                            <p className={`${isOwn ? 'text-white' : 'text-gray-900'}`}>
                              {msg.message}
                            </p>
                          )}
                          
                          {/* Show file attachment if exists */}
                          <FileAttachment fileAttachment={msg.fileAttachment} isOwn={isOwn} />
                          
                          <div className={`flex items-center justify-between mt-1 ${
                            isOwn ? 'text-green-100' : 'text-gray-500'
                          }`}>
                            <span className="text-xs">
                              {formatTime(msg.timestamp)}
                            </span>
                            {isOwn && (
                              <span className="ml-1">
                                {renderMessageStatus(msg.status)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : msg.type === 'voice' ? (
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-4' : 'mt-1'}`}>
                      {!isOwn && showAvatar && (
                        <img 
                          src={getUserAvatarUrl(msg.user)} 
                          alt={msg.user}
                          className="w-8 h-8 rounded-full mr-2 flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = getAvatarUrl(msg.user)
                          }}
                        />
                      )}
                      {!isOwn && !showAvatar && (
                        <div className="w-8 h-8 mr-2 flex-shrink-0"></div>
                      )}
                      
                      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : ''}`}>
                        {!isOwn && showAvatar && (
                          <p className="text-xs text-gray-500 mb-1 ml-1">{msg.user}</p>
                        )}
                        <div className={`px-4 py-2 rounded-lg backdrop-blur-sm relative ${
                          isOwn 
                            ? 'bg-green-500 text-white rounded-br-sm shadow-lg' 
                            : 'bg-white/90 text-gray-900 rounded-bl-sm shadow-md border border-white/20'
                        }`}>
                          {/* Message tail for voice notes */}
                          {isOwn ? (
                            <div className="absolute -right-1 bottom-0 w-0 h-0 border-l-[8px] border-l-green-500 border-t-[8px] border-t-transparent"></div>
                          ) : (
                            <div className="absolute -left-1 bottom-0 w-0 h-0 border-r-[8px] border-r-white/90 border-t-[8px] border-t-transparent"></div>
                          )}
                          
                          <VoiceNotePlayer voiceNote={msg.voiceNote} isOwn={isOwn} />
                          
                          <div className={`flex items-center justify-between mt-1 ${
                            isOwn ? 'text-green-100' : 'text-gray-500'
                          }`}>
                            <span className="text-xs">
                              {formatTime(msg.timestamp)}
                            </span>
                            {isOwn && (
                              <span className="ml-1">
                                {renderMessageStatus(msg.status)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-4' : 'mt-1'}`}>
                      {!isOwn && showAvatar && (
                        <img 
                          src={getUserAvatarUrl(msg.user)} 
                          alt={msg.user}
                          className="w-8 h-8 rounded-full mr-2 flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = getAvatarUrl(msg.user)
                          }}
                        />
                      )}
                      {!isOwn && !showAvatar && (
                        <div className="w-8 h-8 mr-2 flex-shrink-0"></div>
                      )}
                      
                      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : ''}`}>
                        {!isOwn && showAvatar && (
                          <p className="text-xs text-gray-500 mb-1 ml-1">{msg.user}</p>
                        )}
                        <div className={`px-4 py-2 rounded-lg backdrop-blur-sm relative ${
                          isOwn 
                            ? 'bg-green-500 text-white rounded-br-sm shadow-lg' 
                            : 'bg-white/90 text-gray-900 rounded-bl-sm shadow-md border border-white/20'
                        }`}>
                          {/* Message tail for WhatsApp-like appearance */}
                          {isOwn ? (
                            <div className="absolute -right-1 bottom-0 w-0 h-0 border-l-[8px] border-l-green-500 border-t-[8px] border-t-transparent"></div>
                          ) : (
                            <div className="absolute -left-1 bottom-0 w-0 h-0 border-r-[8px] border-r-white/90 border-t-[8px] border-t-transparent"></div>
                          )}
                          
                          <p className="text-sm">{msg.message}</p>
                          <div className={`flex items-center justify-between mt-1 ${
                            isOwn ? 'text-green-100' : 'text-gray-500'
                          }`}>
                            <span className="text-xs">
                              {formatTime(msg.timestamp)}
                            </span>
                            {isOwn && (
                              <span className="ml-1">
                                {renderMessageStatus(msg.status)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            
            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="flex justify-start">
                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md border border-white/20">
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-600 ml-2 font-medium">
                      {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200/50 p-4 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">
                  Uploading {selectedFile?.name}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <div className="bg-red-500 text-white p-3 flex items-center justify-between animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Recording voice note...</span>
              <span className="text-lg font-mono">
                {formatDuration(recordingDuration)}
              </span>
            </div>
            <button
              onClick={stopRecording}
              className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded-full text-sm transition-colors text-white font-medium"
            >
              Send
            </button>
          </div>
        )}

        {/* Message Input */}
        <div className="border-t border-gray-200/50 p-4 shadow-lg" style={{ backgroundColor: '#075E54' }}>
          {!isRecording && (
            <form onSubmit={sendMessage} className="flex items-center space-x-3">
              <button type="button" className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </button>
              <button 
                type="button" 
                onClick={openFilePicker}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Attach file"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
                </svg>
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Type a message"
                  className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all duration-200 shadow-sm border border-white/20 placeholder-gray-500"
                />
              </div>
              <button
                type="button"
                onMouseDown={handleMicPress}
                onMouseUp={handleMicRelease}
                onMouseLeave={handleMicRelease}
                onTouchStart={handleMicPress}
                onTouchEnd={handleMicRelease}
                onTouchCancel={handleMicCancel}
                className={`p-3 rounded-full transition-all duration-200 shadow-sm select-none ${
                  isRecording 
                    ? 'bg-red-500 text-white scale-110 shadow-lg' 
                    : isPressingMic
                    ? 'bg-red-400 text-white scale-105 shadow-md'
                    : 'bg-white/20 hover:bg-white/30 text-white hover:shadow-md'
                }`}
                title="Hold to record voice note"
                style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
              >
                {isRecording ? (
                  <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                )}
              </button>
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* WhatsApp-style Floating Contacts Button (Mobile Only) */}
      <button
        onClick={() => setShowContactsModal(true)}
        className="lg:hidden fixed bottom-24 left-4 z-40 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}
        title="View Contacts"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {onlineUsers.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {onlineUsers.length}
          </span>
        )}
      </button>

      {/* WhatsApp-style Contacts Modal (Mobile Only) */}
      {showContactsModal && (
        <>
          {/* Backdrop */}
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-50 transition-opacity"
            onClick={() => setShowContactsModal(false)}
          />
          
          {/* Modal/Drawer */}
          <div className="lg:hidden fixed inset-y-0 left-0 w-full max-w-sm bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out">
            <div className="h-full flex flex-col">
              {/* Header - WhatsApp style */}
              <div className="p-4 border-b border-gray-200" style={{ backgroundColor: '#075E54' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShowContactsModal(false)}
                      className="p-2 hover:bg-white/20 rounded-lg"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <h2 className="text-lg font-semibold text-white">Contacts</h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-white/20 rounded-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                    <button className="p-2 hover:bg-white/20 rounded-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Online Members Count */}
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-700">
                  {onlineUsers.length} {onlineUsers.length === 1 ? 'member' : 'members'} online
                </p>
              </div>

              {/* Contacts List */}
              <div className="flex-1 overflow-y-auto">
                {onlineUsers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-500 text-sm">No members online</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {onlineUsers.map((user) => (
                      <div 
                        key={user.name} 
                        className="flex items-center space-x-4 p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => setShowContactsModal(false)}
                      >
                        <div className="relative flex-shrink-0">
                          <img 
                            src={user.avatar} 
                            alt={user.name}
                            className="w-12 h-12 rounded-full"
                            onError={(e) => {
                              e.currentTarget.src = getUserAvatarUrl(user.name)
                            }}
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-sm text-green-500">Online</p>
                        </div>
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer - Current User */}
              <div className="p-4 border-t border-gray-200" style={{ backgroundColor: '#075E54' }}>
                <div className="flex items-center space-x-3">
                  <img 
                    src={getUserAvatarUrl(userName)} 
                    alt={userName}
                    className="w-10 h-10 rounded-full"
                    onError={handleImageError}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{userName}</p>
                    <p className="text-xs text-white/80">You</p>
                  </div>
                  <button 
                    onClick={() => {
                      setShowContactsModal(false)
                      handleSignOut()
                    }}
                    className="p-2 hover:bg-white/20 rounded-lg"
                    title="Logout"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* WhatsApp-style Full-Screen Image Viewer */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          onClick={() => setFullscreenImage(null)}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
        >
          {/* Close button */}
          <button
            onClick={() => setFullscreenImage(null)}
            className="absolute top-4 right-4 z-10 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full transition-all duration-200"
            title="Close (ESC)"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image container */}
          <div 
            className="relative max-w-full max-h-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={fullscreenImage.url} 
              alt={fullscreenImage.fileName}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              style={{ 
                maxHeight: '90vh',
                maxWidth: '90vw'
              }}
            />
            
            {/* Image info overlay */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-3 rounded-lg backdrop-blur-sm">
              <p className="text-sm font-medium truncate">{fullscreenImage.fileName}</p>
            </div>
          </div>

          {/* Download button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              const link = document.createElement('a')
              link.href = fullscreenImage.url
              link.download = fullscreenImage.fileName
              link.click()
            }}
            className="absolute bottom-4 right-16 z-10 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full transition-all duration-200"
            title="Download"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

