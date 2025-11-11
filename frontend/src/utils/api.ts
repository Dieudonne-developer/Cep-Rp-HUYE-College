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
      // Known production backend URL
      const knownBackendUrl = 'https://cep-backend-hjfu.onrender.com';
      
      // If frontend URL contains -1, backend is likely without -1
      if (origin.includes('-1.onrender.com')) {
        const inferredBackendUrl = origin.replace('-1.onrender.com', '.onrender.com');
        console.log('Inferred backend URL from frontend:', inferredBackendUrl);
        // Use known backend URL if it matches the pattern, otherwise use inferred
        if (inferredBackendUrl === knownBackendUrl) {
          console.log('Using known backend URL:', knownBackendUrl);
          return knownBackendUrl;
        }
        return inferredBackendUrl;
      }
      
      // If frontend URL contains 'frontend', replace with 'backend'
      if (hostname.includes('frontend')) {
        const inferredBackendUrl = origin.replace('frontend', 'backend');
        console.log('Inferred backend URL from service name:', inferredBackendUrl);
        // Use known backend URL if it matches the pattern, otherwise use inferred
        if (inferredBackendUrl === knownBackendUrl) {
          console.log('Using known backend URL:', knownBackendUrl);
          return knownBackendUrl;
        }
        return inferredBackendUrl;
      }
      
      // Fallback: try common pattern (remove -1 suffix)
      const inferredBackendUrl = origin.replace(/-1\.onrender\.com$/, '.onrender.com');
      if (inferredBackendUrl !== origin) {
        console.log('Inferred backend URL (fallback):', inferredBackendUrl);
        if (inferredBackendUrl === knownBackendUrl) {
          console.log('Using known backend URL:', knownBackendUrl);
          return knownBackendUrl;
        }
        return inferredBackendUrl;
      }
      
      // Last fallback: use known backend URL for production
      console.log('Using known production backend URL:', knownBackendUrl);
      return knownBackendUrl;
    }
  }

  // Local development fallback
  const port = import.meta.env.VITE_API_PORT || '4000';
  const localUrl = `http://localhost:${port}`;
  console.log('Using localhost fallback:', localUrl);
  return localUrl;
}

