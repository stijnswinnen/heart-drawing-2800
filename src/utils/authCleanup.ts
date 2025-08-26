/**
 * Comprehensive auth state cleanup utility to prevent authentication limbo states
 */
export const cleanupAuthState = () => {
  // Clear all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Clear from sessionStorage if available
  try {
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    // SessionStorage might not be available in some environments
    console.log('SessionStorage not available for cleanup');
  }
  
  console.log('Auth state cleanup completed');
};