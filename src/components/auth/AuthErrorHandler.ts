import { AuthError } from "@supabase/supabase-js";
import { toast } from "sonner";

export const handleAuthError = (error: AuthError) => {
  console.error('Auth error:', error);
  let errorMessage = 'An error occurred during authentication.';
  
  if (error.message.includes('Invalid login credentials')) {
    errorMessage = 'Invalid email or password. Please check your credentials and try again.';
  } else if (error.message.includes('Email not confirmed')) {
    errorMessage = 'Please verify your email address before signing in.';
  } else if (error.message.includes('User not found')) {
    errorMessage = 'No account found with these credentials.';
  }
  
  toast.error(errorMessage);
};