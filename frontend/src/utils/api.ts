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
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Detect if we're running on Render
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // If frontend is on Render, use Render backend URL
    if (hostname.includes('onrender.com')) {
      // Check if this is the specific Render frontend URL
      if (hostname === 'cep-rp-huye-college-1.onrender.com' || hostname.includes('cep-rp-huye-college-1')) {
        return 'https://cep-rp-huye-college.onrender.com';
      }
      // Generic Render detection - try to infer backend URL
      // If frontend is on Render, backend is likely on the same domain pattern
      const frontendUrl = window.location.origin;
      // Try common Render backend URL patterns
      if (frontendUrl.includes('-1.onrender.com')) {
        // Frontend is typically named with -1 suffix, backend without
        const backendUrl = frontendUrl.replace('-1.onrender.com', '.onrender.com');
        return backendUrl;
      }
      // Fallback: use the same origin (if backend is on same domain)
      return frontendUrl;
    }
  }

  // Local development fallback
  const port = import.meta.env.VITE_API_PORT || '4000';
  return `http://localhost:${port}`;
}

// Export a constant for use in components
export const API_BASE_URL = getApiBaseUrl();

