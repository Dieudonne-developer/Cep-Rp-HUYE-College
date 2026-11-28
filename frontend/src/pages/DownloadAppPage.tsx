import React from 'react'
import { Link } from 'react-router-dom'

export default function DownloadAppPage() {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Download CEP Mobile App</h2>
      <p className="text-gray-700 mb-6">Get the CEP mobile app for Android to stay connected with your family.</p>

      <div className="max-w-md mx-auto">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-xl font-semibold text-blue-800 mb-4">CEP App</h3>
          <p className="text-gray-600 mb-4">For choir members, family members, and visitors</p>
          <a
            href="https://expo.dev/artifacts/eas/iFZs136NoaOTXrmOsr80jKA0HUt3Oj6Yu0v95l9HEH0.apk"
            download="cep app.apk"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            Download CEP App
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
          <li>4. Open the app and follow the setup instructions</li>
        </ol>
      </div>

      <p className="mt-6 text-center text-sm">
        <Link to="/" className="text-blue-700 hover:text-blue-900 underline">Back to Home</Link>
      </p>
    </div>
  )
}
