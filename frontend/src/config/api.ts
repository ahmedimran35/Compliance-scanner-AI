// API Configuration
export const getApiUrl = () => {
  // Check if we're in the browser
  if (typeof window !== 'undefined') {
    // Get the current hostname and port
    const currentHost = window.location.hostname;
    const currentPort = window.location.port;
    
    // If we're accessing via network IP, use the same IP for backend
    if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
      // Use the same hostname but port 3001 for backend
      return `http://${currentHost}:3001`;
    }
  }
  
  // Default to localhost:3001
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

// Export the API URL
export const API_URL = getApiUrl(); 