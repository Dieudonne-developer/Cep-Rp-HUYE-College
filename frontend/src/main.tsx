import './style.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { initializeLucideIcons } from './utils/lucideIcons'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import FamiliesPage from './pages/FamiliesPage'
import ChoirPage from './pages/Ishyangaryera Choir/ChoirPage'
import AdminLogin from './pages/Ishyangaryera Choir/admin/AdminLogin'
import TestLoginPage from './pages/TestLoginPage'
import TestRoutes from './pages/Ishyangaryera Choir/admin/TestRoutes'
import AdminLayout from './pages/Ishyangaryera Choir/admin/AdminLayout'
import AdminDashboard from './pages/Ishyangaryera Choir/admin/AdminDashboard'
import AdminEvents from './pages/Ishyangaryera Choir/admin/AdminEvents'
import AdminSongs from './pages/Ishyangaryera Choir/admin/AdminSongs'
import AdminMembers from './pages/Ishyangaryera Choir/admin/AdminMembers'
import AdminIdeas from './pages/Ishyangaryera Choir/admin/AdminIdeas'
import AdminSupport from './pages/Ishyangaryera Choir/admin/AdminSupport'
import AdminSuperAdmins from './pages/Ishyangaryera Choir/admin/AdminSuperAdmins'
import SuperAdminDashboard from './pages/Ishyangaryera Choir/admin/SuperAdminDashboard'
import ChatPage from './pages/Ishyangaryera Choir/ChatPage'
import RegisterPage from './pages/Ishyangaryera Choir/RegisterPage'
import ForgotPasswordPage from './pages/Ishyangaryera Choir/ForgotPasswordPage'
import AnointedPage from './pages/Anointed/Page'
import AbanyamugishaPage from './pages/Abanyamugisha/Page'
import Psalm23Page from './pages/Psalm23/Page'
import Psalm46Page from './pages/Psalm46/Page'
import ProtocolPage from './pages/Protocol/Page'
import SocialPage from './pages/Social/Page'
import EvangelicalPage from './pages/Evangelical/Page'
import ActivitiesPage from './pages/ActivitiesPage'
import SupportPage from './pages/SupportPage'
import IdeasPage from './pages/IdeasPage'
import ChatHubPage from './pages/ChatHubPage'
import MemberPage from './pages/MemberPage'
import CepRegisterPage from './pages/CepRegisterPage'
import CepMembersPage from './pages/CepMembersPage'
import AboutPage from './pages/AboutPage'

function MainLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
      <header className="bg-blue-700 text-white shadow-lg p-4 sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-white p-2 hover:bg-blue-600 rounded-lg transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl md:text-3xl font-extrabold tracking-tight">CEP Huye College</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="flex items-center px-3 py-2 rounded-lg transition duration-300 ease-in-out bg-blue-800">Home</Link>
            <Link to="/families" className="flex items-center px-3 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-blue-600">Our Families</Link>
            <Link to="/activities" className="flex items-center px-3 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-blue-600">Activities</Link>
            <Link to="/support" className="flex items-center px-3 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-blue-600">Support</Link>
            <Link to="/ideas" className="flex items-center px-3 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-blue-600">Ideas</Link>
            <Link to="/chat" className="flex items-center px-3 py-2 rounded-lg transition duration-300 ease-in-out hover:bg-blue-600">Chat</Link>
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
              <Link 
                to="/activities" 
                className="block px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Activities
              </Link>
              <Link 
                to="/support" 
                className="block px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Support
              </Link>
              <Link 
                to="/ideas" 
                className="block px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Ideas
              </Link>
              <Link 
                to="/chat" 
                className="block px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Chat
              </Link>
            </nav>
          </div>
        )}
      </header>
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {children}
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center mt-8">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} CEP Huye College. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function App() {
  const location = useLocation()

  // If on choir page, render it without the main layout
  if (location.pathname === '/choir') {
    return <ChoirPage />
  }

  // If on anointed page, render it without the main layout
  if (location.pathname === '/anointed') {
    return <AnointedPage />
  }

  // If on abanyamugisha page, render it without the main layout
  if (location.pathname === '/abanyamugisha') {
    return <AbanyamugishaPage />
  }

  // If on psalm23 page, render it without the main layout
  if (location.pathname === '/psalm23') {
    return <Psalm23Page />
  }

  // If on psalm46 page, render it without the main layout
  if (location.pathname === '/psalm46') {
    return <Psalm46Page />
  }

  // If on protocol page, render it without the main layout
  if (location.pathname === '/protocol') {
    return <ProtocolPage />
  }

  // If on social page, render it without the main layout
  if (location.pathname === '/social') {
    return <SocialPage />
  }

  // If on evangelical page, render it without the main layout
  if (location.pathname === '/evangelical') {
    return <EvangelicalPage />
  }

  // Dedicated chat page (standalone)
  if (location.pathname === '/admin/chat') {
    return <ChatPage />
  }

  if (location.pathname === '/choir/chat') {
    return <ChatPage />
  }

  // Anointed chat page (standalone)
  if (location.pathname === '/anointed/chat') {
    return <ChatPage />
  }

  // Abanyamugisha chat page (standalone)
  if (location.pathname === '/abanyamugisha/chat') {
    return <ChatPage />
  }

  // Psalm23 chat page (standalone)
  if (location.pathname === '/psalm23/chat') {
    return <ChatPage />
  }

  // Psalm46 chat page (standalone)
  if (location.pathname === '/psalm46/chat') {
    return <ChatPage />
  }

  // Protocol chat page (standalone)
  if (location.pathname === '/protocol/chat') {
    return <ChatPage />
  }

  // Social chat page (standalone)
  if (location.pathname === '/social/chat') {
    return <ChatPage />
  }

  // Evangelical chat page (standalone)
  if (location.pathname === '/evangelical/chat') {
    return <ChatPage />
  }

  // CEPier chat page (standalone)
  if (location.pathname === '/cepier/chat') {
    return <ChatPage />
  }

  if (location.pathname === '/cepier/members') {
    return <CepMembersPage />
  }

  // Registration page (standalone)
  if (location.pathname === '/choir/register') {
    return <RegisterPage />
  }

  // CEP-wide registration page (standalone, neutral header)
  if (location.pathname === '/register') {
    return <CepRegisterPage />
  }

  // Anointed registration page (standalone)
  if (location.pathname === '/anointed/register') {
    return <RegisterPage />
  }

  // Abanyamugisha registration page (standalone)
  if (location.pathname === '/abanyamugisha/register') {
    return <RegisterPage />
  }

  // Psalm23 registration page (standalone)
  if (location.pathname === '/psalm23/register') {
    return <RegisterPage />
  }

  // Psalm46 registration page (standalone)
  if (location.pathname === '/psalm46/register') {
    return <RegisterPage />
  }

  // Protocol registration page (standalone)
  if (location.pathname === '/protocol/register') {
    return <RegisterPage />
  }

  // Social registration page (standalone)
  if (location.pathname === '/social/register') {
    return <RegisterPage />
  }

  // Evangelical registration page (standalone)
  if (location.pathname === '/evangelical/register') {
    return <RegisterPage />
  }

  // Forgot password page (standalone)
  if (location.pathname === '/choir/forgot-password') {
    return <ForgotPasswordPage />
  }

  // Anointed forgot password page (standalone)
  if (location.pathname === '/anointed/forgot-password') {
    return <ForgotPasswordPage />
  }

  // Abanyamugisha forgot password page (standalone)
  if (location.pathname === '/abanyamugisha/forgot-password') {
    return <ForgotPasswordPage />
  }

  // Psalm23 forgot password page (standalone)
  if (location.pathname === '/psalm23/forgot-password') {
    return <ForgotPasswordPage />
  }

  // Psalm46 forgot password page (standalone)
  if (location.pathname === '/psalm46/forgot-password') {
    return <ForgotPasswordPage />
  }

  // Protocol forgot password page (standalone)
  if (location.pathname === '/protocol/forgot-password') {
    return <ForgotPasswordPage />
  }

  // Social forgot password page (standalone)
  if (location.pathname === '/social/forgot-password') {
    return <ForgotPasswordPage />
  }

  // Evangelical forgot password page (standalone)
  if (location.pathname === '/evangelical/forgot-password') {
    return <ForgotPasswordPage />
  }

  // CEPier forgot password page (standalone)
  if (location.pathname === '/cepier/forgot-password') {
    return <ForgotPasswordPage />
  }

  // If on old admin path, redirect to new /admin path
  if (location.pathname.startsWith('/choir/admin')) {
    const newPath = location.pathname.replace('/choir/admin', '/admin') + location.search
    window.history.replaceState(null, '', newPath)
  }

  // If on admin pages, render with admin layout
  if (location.pathname.startsWith('/admin')) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/test" element={<TestLoginPage />} />
        <Route path="/admin/routes" element={<TestRoutes />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="songs" element={<AdminSongs />} />
          <Route path="members" element={<AdminMembers />} />
          <Route path="ideas" element={<AdminIdeas />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="super-admin-dashboard" element={<SuperAdminDashboard />} />
          <Route path="super-admins" element={<AdminSuperAdmins />} />
        </Route>
      </Routes>
    )
  }

  // Anointed admin pages reuse same admin components
  if (location.pathname.startsWith('/anointed/admin')) {
    return (
      <Routes>
        <Route path="/anointed/admin/login" element={<AdminLogin />} />
        <Route path="/anointed/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="songs" element={<AdminSongs />} />
          <Route path="members" element={<AdminMembers />} />
          <Route path="ideas" element={<AdminIdeas />} />
          <Route path="support" element={<AdminSupport />} />
        </Route>
      </Routes>
    )
  }

  // Abanyamugisha admin pages reuse same admin components
  if (location.pathname.startsWith('/abanyamugisha/admin')) {
    return (
      <Routes>
        <Route path="/abanyamugisha/admin/login" element={<AdminLogin />} />
        <Route path="/abanyamugisha/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="songs" element={<AdminSongs />} />
          <Route path="members" element={<AdminMembers />} />
          <Route path="ideas" element={<AdminIdeas />} />
          <Route path="support" element={<AdminSupport />} />
        </Route>
      </Routes>
    )
  }

  // Psalm23 admin pages reuse same admin components
  if (location.pathname.startsWith('/psalm23/admin')) {
    return (
      <Routes>
        <Route path="/psalm23/admin/login" element={<AdminLogin />} />
        <Route path="/psalm23/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="songs" element={<AdminSongs />} />
          <Route path="members" element={<AdminMembers />} />
          <Route path="ideas" element={<AdminIdeas />} />
          <Route path="support" element={<AdminSupport />} />
        </Route>
      </Routes>
    )
  }

  // Psalm46 admin pages reuse same admin components
  if (location.pathname.startsWith('/psalm46/admin')) {
    return (
      <Routes>
        <Route path="/psalm46/admin/login" element={<AdminLogin />} />
        <Route path="/psalm46/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="songs" element={<AdminSongs />} />
          <Route path="members" element={<AdminMembers />} />
          <Route path="ideas" element={<AdminIdeas />} />
          <Route path="support" element={<AdminSupport />} />
        </Route>
      </Routes>
    )
  }

  // Protocol admin pages reuse same admin components
  if (location.pathname.startsWith('/protocol/admin')) {
    return (
      <Routes>
        <Route path="/protocol/admin/login" element={<AdminLogin />} />
        <Route path="/protocol/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="songs" element={<AdminSongs />} />
          <Route path="members" element={<AdminMembers />} />
          <Route path="ideas" element={<AdminIdeas />} />
          <Route path="support" element={<AdminSupport />} />
        </Route>
      </Routes>
    )
  }

  // Social admin pages reuse same admin components
  if (location.pathname.startsWith('/social/admin')) {
    return (
      <Routes>
        <Route path="/social/admin/login" element={<AdminLogin />} />
        <Route path="/social/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="songs" element={<AdminSongs />} />
          <Route path="members" element={<AdminMembers />} />
          <Route path="ideas" element={<AdminIdeas />} />
          <Route path="support" element={<AdminSupport />} />
        </Route>
      </Routes>
    )
  }

  // Evangelical admin pages reuse same admin components
  if (location.pathname.startsWith('/evangelical/admin')) {
    return (
      <Routes>
        <Route path="/evangelical/admin/login" element={<AdminLogin />} />
        <Route path="/evangelical/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="songs" element={<AdminSongs />} />
          <Route path="members" element={<AdminMembers />} />
          <Route path="ideas" element={<AdminIdeas />} />
          <Route path="support" element={<AdminSupport />} />
        </Route>
      </Routes>
    )
  }

  // For other pages, use the main layout
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/families" element={<FamiliesPage />} />
        <Route path="/activities" element={<ActivitiesPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/ideas" element={<IdeasPage />} />
        <Route path="/chat" element={<ChatHubPage />} />
        <Route path="/member" element={<MemberPage />} />
      </Routes>
    </MainLayout>
  )
}

function AppWrapper() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <App />
    </BrowserRouter>
  )
}

// Initialize Lucide icons
initializeLucideIcons()

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
)


