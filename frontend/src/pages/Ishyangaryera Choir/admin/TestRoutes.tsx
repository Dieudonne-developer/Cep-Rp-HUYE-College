import React from 'react'

export default function TestRoutes() {
  const testRoutes = [
    {
      title: 'Public Choir Site',
      url: '/choir',
      description: 'Main choir page for public users',
      icon: 'music'
    },
    {
      title: 'Admin Test Login',
      url: '/admin/test',
      description: 'Enhanced test login page with credentials',
      icon: 'shield-check'
    },
    {
      title: 'Admin Login',
      url: '/admin/login',
      description: 'Standard admin login page',
      icon: 'log-in'
    },
    {
      title: 'Admin Dashboard',
      url: '/admin/dashboard',
      description: 'Admin dashboard (requires login)',
      icon: 'layout-dashboard'
    },
    {
      title: 'Manage Events',
      url: '/admin/events',
      description: 'Event management (requires login)',
      icon: 'calendar'
    },
    {
      title: 'Manage Songs',
      url: '/admin/songs',
      description: 'Song management (requires login)',
      icon: 'music'
    },
    {
      title: 'Manage Members',
      url: '/admin/members',
      description: 'Member management (requires login)',
      icon: 'users'
    },
    {
      title: 'Review Ideas',
      url: '/admin/ideas',
      description: 'Idea review system (requires login)',
      icon: 'lightbulb'
    }
  ]

  const testCredentials = {
    email: 'admin@ishyangaryera.com',
    password: 'admin123',
    role: 'Choir Administrator'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i data-lucide="test-tube" className="w-10 h-10 text-white"></i>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Ishyanga Ryera Choir</h1>
          <h2 className="text-2xl text-gray-600 mb-2">Test Routes & Credentials</h2>
          <p className="text-gray-500">Complete testing environment for the choir administration system</p>
        </div>

        {/* Test Credentials */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <i data-lucide="key" className="w-6 h-6 mr-2 text-blue-600"></i>
            Test Credentials
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">Email</label>
                <div className="font-mono bg-white px-3 py-2 rounded border text-sm">{testCredentials.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">Password</label>
                <div className="font-mono bg-white px-3 py-2 rounded border text-sm">{testCredentials.password}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">Role</label>
                <div className="font-mono bg-white px-3 py-2 rounded border text-sm">{testCredentials.role}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Routes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testRoutes.map((route, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <i data-lucide={route.icon} className="w-6 h-6 text-blue-600"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-800">{route.title}</h3>
              </div>
              
              <p className="text-gray-600 mb-4">{route.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <i data-lucide="link" className="w-4 h-4 mr-2"></i>
                  <span className="font-mono">{route.url}</span>
                </div>
                
                <a
                  href={route.url}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
                >
                  <i data-lucide="external-link" className="w-4 h-4 mr-2"></i>
                  Visit Route
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Backend Status */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <i data-lucide="server" className="w-6 h-6 mr-2 text-green-600"></i>
            Backend Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">API Endpoints</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• POST /api/admin/login</li>
                <li>• GET /api/admin/dashboard</li>
                <li>• CRUD /api/admin/events</li>
                <li>• CRUD /api/admin/songs</li>
                <li>• CRUD /api/admin/members</li>
                <li>• CRUD /api/admin/ideas</li>
              </ul>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Database</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• MongoDB with Mongoose</li>
                <li>• Admin authentication</li>
                <li>• Activity logging</li>
                <li>• Seeded test data</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <i data-lucide="rocket" className="w-6 h-6 mr-2"></i>
            Quick Start Guide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h4 className="font-semibold mb-2">1. Start Backend</h4>
              <p className="text-sm opacity-90">Run the Node.js server on port 4000</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h4 className="font-semibold mb-2">2. Start Frontend</h4>
              <p className="text-sm opacity-90">Run the React dev server on port 5173</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <h4 className="font-semibold mb-2">3. Test Login</h4>
              <p className="text-sm opacity-90">Use the test credentials to access admin panel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}






