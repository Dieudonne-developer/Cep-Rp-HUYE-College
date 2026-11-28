import React from 'react'
import { Link } from 'react-router-dom'

export default function AdminDownloadAppPage() {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Download Admin CEP App</h2>
      <p className="text-gray-700 mb-6">Get the Admin CEP mobile app for Android to manage your family's content.</p>

      <div className="max-w-md mx-auto">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Admin CEP</h3>
          <p className="text-gray-600 mb-4">For family administrators and content managers</p>
          <a
            href="https://cep-rp-huye-college-yt6x-eight.vercel.app/api/download/admin-app"
            download="Admin CEP.apk"
            className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            Download Admin App
          </a>
          <p className="text-xs text-gray-500 mt-2">Version 1.0.0 | Android APK</p>
        </div>
      </div>

      <div className="mt-8 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h4 className="font-semibold text-yellow-800 mb-2">Installation Instructions</h4>
        <ol className="text-sm text-gray-700 space-y-1">
          <li>1. Download the APK file to your Android device</li>
          <li>2. Enable "Install from unknown sources" in Settings → Security</li>
          <li>3. Tap the downloaded APK file to install</li>
          <li>4. Open the app and log in with your admin credentials</li>
        </ol>
      </div>

      <p className="mt-6 text-center text-sm">
        <Link to="/admin/mobile-apps" className="text-blue-700 hover:text-blue-900 underline">Upload New Version</Link>
      </p>
    </div>
  )
}
