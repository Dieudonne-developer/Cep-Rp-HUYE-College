/**
 * Get the API base URL based on the current environment
 * 
 * Priority:
 * 1. VITE_API_BASE_URL environment variable (set at build time)
 * 2. Detect Render environment (if hostname contains .onrender.com)
 * 3. Fallback to localhost for local development
 */
export function getApiBaseUrl(): string {
  // Check if VITE_API_BASE_URL is set (build-time environment variable)
  const viteApiUrl = import.meta.env.VITE_API_BASE_URL;
  if (viteApiUrl && viteApiUrl.trim() !== '') {
    console.log('Using VITE_API_BASE_URL:', viteApiUrl);
    return viteApiUrl;
  }

  // Detect if we're running on Render
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const origin = window.location.origin;
    
    console.log('Detected hostname:', hostname);
    console.log('Detected origin:', origin);
    
    // If frontend is on Render, use Render backend URL
    if (hostname.includes('onrender.com')) {
      // Known backend URL - use it directly for production
      const knownBackendUrl = 'https://cep-backend-hjfu.onrender.com';
      console.log('Using known backend URL:', knownBackendUrl);
      return knownBackendUrl;
    }
  }

  // Local development fallback
  const port = import.meta.env.VITE_API_PORT || '4000';
  const localUrl = `http://localhost:${port}`;
  console.log('Using localhost fallback:', localUrl);
  return localUrl;
}

