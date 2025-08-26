import { AuthError } from "@supabase/supabase-js";
import { toast } from "sonner";

export const handleAuthError = (error: AuthError) => {
  console.error('Auth error details:', {
    message: error.message,
    status: error.status,
    name: error.name
  });
  
  let errorMessage = 'Er is een fout opgetreden tijdens de authenticatie.';
  
  // Check both error message and error code
  if (error.message.includes('invalid_credentials') || error.message.includes('Invalid login credentials')) {
    errorMessage = 'Ongeldige inloggegevens. Controleer je e-mailadres en wachtwoord.';
    console.log('🔍 Login failed - either email doesn\'t exist in auth.users or password is incorrect');
  } else if (error.message.includes('Email not confirmed')) {
    errorMessage = 'Verifieer eerst je e-mailadres voordat je inlogt.';
  } else if (error.message.includes('User not found')) {
    errorMessage = 'Geen account gevonden met deze gegevens.';
  } else if (error.message.includes('Invalid grant')) {
    errorMessage = 'Ongeldige inloggegevens. Controleer je gegevens en probeer opnieuw.';
  }
  
  toast.error(errorMessage);
};