import React, { useEffect, useState } from 'react'
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom'
import { useLucideIcons } from '../../../utils/lucideIcons'

type Admin = {
  id: string
  name: string
  email: string
  role: string
}

export default function AdminLayout() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const baseAdminPath = '/admin'
  const loginPath = `/admin/login`

  // Get admin group to customize sidebar labels
  const adminGroup = (() => {
    try {
      const raw = localStorage.getItem('admin')
      if (!raw) return 'choir'
      const obj = JSON.parse(raw)
      return obj?.adminGroup || 'choir'
    } catch { return 'choir' }
  })()
  const isProtocolAdmin = adminGroup === 'protocol'
  const isEvangelicalAdmin = adminGroup === 'evangelical'
  const isPsalm23Admin = adminGroup === 'psalm23'
  const isPsalm46Admin = adminGroup === 'psalm46'
  const isPsalmAdmin = isPsalm23Admin || isPsalm46Admin
  const isAbanyamugishaAdmin = adminGroup === 'abanyamugisha'
  const isSocialAdmin = adminGroup === 'social'
  const isSuperAdmin = admin?.role === 'super-admin'

  useEffect(() => {
    const adminData = localStorage.getItem('admin')
    if (!adminData) {
      navigate(loginPath)
      return
    }
    const parsed = JSON.parse(adminData)
    setAdmin(parsed)
    
    // Redirect super admin to super admin dashboard if they try to access regular admin pages
    if (parsed.role === 'super-admin' && location.pathname !== '/admin/super-admins' && !location.pathname.includes('super-admin')) {
      // Only redirect if they're not already on a super admin page
      if (location.pathname === '/admin' || location.pathname === '/admin/dashboard') {
        navigate('/admin/super-admins')
      }
    }
  }, [navigate, loginPath, location.pathname])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useLucideIcons()

  const handleNavLinkClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin')
    navigate(loginPath)
  }

  if (!admin) {
    return null // Will redirect to login
  }

  const getAdminGroupLabel = () => {
    const groups: Record<string, string> = {
      'cepier': 'CEPier',
      'choir': 'Choir',
      'anointed': 'Anointed',
      'abanyamugisha': 'Abanyamugisha',
      'psalm23': 'Psalm 23',
      'psalm46': 'Psalm 46',
      'protocol': 'Protocol',
      'social': 'Social',
      'evangelical': 'Evangelical'
    }
    return groups[adminGroup] || 'Admin'
  }

  // All admins share a dedicated admin chat room
  const getChatUrl = () => '/admin/chat'

  // Handle chat navigation - set up sessionStorage with admin info
  const handleChatClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    // Set up chat session with admin info
    if (admin) {
      const adminUsername = (admin as any).username || admin.name || admin.email.split('@')[0]
      sessionStorage.setItem('chatUser', adminUsername)
      sessionStorage.setItem('userInfo', JSON.stringify({
        username: adminUsername,
        email: admin.email,
        profileImage: (admin as any).profileImage || null,
        role: admin.role
      }))
      sessionStorage.setItem('userGroup', 'admins')
      sessionStorage.setItem('adminGroup', adminGroup)
    }
    // Navigate to chat
    navigate(getChatUrl())
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-blue-700 text-white shadow-lg sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700 lg:hidden"
                aria-label="Open menu"
              >
                {/* Inline SVG for reliability on all devices */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                {/* Lucide fallback (hidden by default) */}
                <i data-lucide="menu" className="w-6 h-6 hidden"></i>
              </button>
              <div className="ml-4 lg:ml-0">
                <h1 className="text-2xl font-extrabold tracking-tight">CEP Admin Panel</h1>
                {!isSuperAdmin && (
                  <p className="text-xs text-blue-200 mt-0.5">{getAdminGroupLabel()} Family Administration</p>
                )}
                {isSuperAdmin && (
                  <p className="text-xs text-blue-200 mt-0.5">Super Administrator - System Management</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm">
                <i data-lucide="user" className="w-4 h-4 text-blue-200"></i>
                <span className="text-blue-100">{admin.name || (admin as any).username || admin.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-lg text-sm flex items-center transition duration-300 ease-in-out"
              >
                <i data-lucide="log-out" className="w-4 h-4 mr-2"></i> Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:relative lg:z-auto lg:translate-x-0 lg:w-64 lg:shadow-sm lg:border-r`}
        >
          <nav className="mt-5 px-2 pb-6 overflow-y-auto h-full">
            <div className="space-y-1">
              {isSuperAdmin ? (
                <>
                  <Link
                    to={`${baseAdminPath}/super-admins`}
                    onClick={handleNavLinkClick}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${location.pathname === `${baseAdminPath}/super-admins` && !location.search.includes('global') && !location.search.includes('tab=homepage') ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'}`}
                  >
                    <i data-lucide="users" className="mr-3 w-5 h-5"></i>
                    Manage Admins
                  </Link>
                  <a
                    href={getChatUrl()}
                    onClick={handleChatClick}
                    onMouseDown={(e) => e.preventDefault()}
                    onTouchStart={(e) => e.preventDefault()}
                    onClickCapture={handleNavLinkClick}
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <i data-lucide="message-circle" className="mr-3 w-5 h-5"></i>
                    Admin Chat
                  </a>
                  <div className="mt-2">
                    <div className="px-2 text-xs uppercase tracking-wider text-gray-400 mb-1">Homepage</div>
                    <Link 
                      to={`${baseAdminPath}/super-admins?tab=homepage&global=activities`} 
                      onClick={handleNavLinkClick}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${location.search.includes('global=activities') ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'}`}
                    >
                      <i data-lucide="calendar" className="mr-3 w-5 h-5"></i>
                      Activities
                    </Link>
                    <Link 
                      to={`${baseAdminPath}/super-admins?tab=homepage&global=ideas`} 
                      onClick={handleNavLinkClick}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${location.search.includes('global=ideas') ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'}`}
                    >
                      <i data-lucide="lightbulb" className="mr-3 w-5 h-5"></i>
                      Ideas
                    </Link>
                    <Link 
                      to={`${baseAdminPath}/super-admins?tab=homepage&global=support`} 
                      onClick={handleNavLinkClick}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${location.search.includes('global=support') ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'}`}
                    >
                      <i data-lucide="heart-handshake" className="mr-3 w-5 h-5"></i>
                      Support
                    </Link>
                    <Link 
                      to={`${baseAdminPath}/super-admins?tab=homepage&global=cepier-members`} 
                      onClick={handleNavLinkClick}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${location.search.includes('global=cepier-members') ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'}`}
                    >
                      <i data-lucide="user-check" className="mr-3 w-5 h-5"></i>
                      CEPier Members
                    </Link>
                  </div>
                  
                </>
              ) : (
                <>
                  <Link
                    to={`${baseAdminPath}/dashboard`}
                    onClick={handleNavLinkClick}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${location.pathname === `${baseAdminPath}/dashboard` ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'}`}
                  >
                    <i data-lucide="layout-dashboard" className="mr-3 w-5 h-5"></i>
                    Dashboard
                  </Link>
                  <Link
                    to={`${baseAdminPath}/events`}
                    onClick={handleNavLinkClick}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${location.pathname === `${baseAdminPath}/events` ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'}`}
                  >
                    <i data-lucide={isAbanyamugishaAdmin ? "heart-handshake" : "calendar"} className="mr-3 w-5 h-5"></i>
                    {isAbanyamugishaAdmin ? 'Prayers answered by God' : 'Events'}
                  </Link>
                  {!isSocialAdmin && (
                  <Link
                    to={`${baseAdminPath}/songs`}
                    onClick={handleNavLinkClick}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${location.pathname === `${baseAdminPath}/songs` ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'}`}
                  >
                    <i data-lucide={isProtocolAdmin ? "sparkles" : isEvangelicalAdmin ? "book-open" : isPsalmAdmin ? "video" : isAbanyamugishaAdmin ? "heart" : "music"} className="mr-3 w-5 h-5"></i>
                    {isProtocolAdmin ? 'Decorating' : isEvangelicalAdmin ? 'Today\'s Bible teaching' : isPsalmAdmin ? 'Videos' : isAbanyamugishaAdmin ? 'Testimony of God\'s works' : 'Songs'}
                  </Link>
                  )}
                  <Link
                    to={`${baseAdminPath}/members`}
                    onClick={handleNavLinkClick}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${location.pathname === `${baseAdminPath}/members` ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'}`}
                  >
                    <i data-lucide="users" className="mr-3 w-5 h-5"></i>
                    Members
                  </Link>
                  <Link
                    to={`${baseAdminPath}/ideas`}
                    onClick={handleNavLinkClick}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${location.pathname === `${baseAdminPath}/ideas` ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'}`}
                  >
                    <i data-lucide={isAbanyamugishaAdmin ? "pray" : "lightbulb"} className="mr-3 w-5 h-5"></i>
                    {isAbanyamugishaAdmin ? 'Prayer requests' : 'Ideas'}
                  </Link>
                  <Link
                    to={`${baseAdminPath}/support`}
                    onClick={handleNavLinkClick}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${location.pathname === `${baseAdminPath}/support` ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'}`}
                  >
                    <i data-lucide="heart-handshake" className="mr-3 w-5 h-5"></i>
                    Support
                  </Link>
                  <a
                    href={getChatUrl()}
                    onClick={handleChatClick}
                    onMouseDown={(e) => e.preventDefault()}
                    onTouchStart={(e) => e.preventDefault()}
                    onClickCapture={handleNavLinkClick}
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <i data-lucide="message-circle" className="mr-3 w-5 h-5"></i>
                    Admin Chat
                  </a>
                </>
              )}
              <div className="pt-4 border-t border-gray-200 mt-4">
                <Link
                  to="/choir"
                  onClick={handleNavLinkClick}
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  <i data-lucide="external-link" className="mr-3 w-5 h-5"></i>
                  View Public Site
                </Link>
              </div>
            </div>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1">
            <Outlet />
          </main>
          
          {/* Footer */}
          <footer className="bg-gray-800 text-white mt-auto">
            <div className="container mx-auto px-4 py-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="text-center md:text-left mb-4 md:mb-0">
                  <p className="text-sm">&copy; {new Date().getFullYear()} CEP Huye College. All rights reserved.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {isSuperAdmin 
                      ? 'Super Administrator Portal - Manage all CEP family administrators'
                      : `${getAdminGroupLabel()} Family Administration Portal`}
                  </p>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <a href="/" className="text-gray-300 hover:text-white transition-colors flex items-center">
                    <i data-lucide="home" className="w-4 h-4 mr-1"></i>
                    Public Site
                  </a>
                  <span className="text-gray-600">|</span>
                  <a href="/families" className="text-gray-300 hover:text-white transition-colors flex items-center">
                    <i data-lucide="users" className="w-4 h-4 mr-1"></i>
                    Our Families
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-900 bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  )
}






