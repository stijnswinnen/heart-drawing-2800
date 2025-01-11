import { AuthError } from "@supabase/supabase-js";
import { toast } from "sonner";

export const handleAuthError = (error: AuthError) => {
  console.error('Auth error:', error);
  let errorMessage = 'Er is een fout opgetreden tijdens de authenticatie.';
  
  // Check both error message and error code
  if (error.message.includes('invalid_credentials') || error.message.includes('Invalid login credentials')) {
    errorMessage = 'Ongeldige inloggegevens. Controleer je e-mailadres en wachtwoord.';
  } else if (error.message.includes('Email not confirmed')) {
    errorMessage = 'Verifieer eerst je e-mailadres voordat je inlogt.';
  } else if (error.message.includes('User not found')) {
    errorMessage = 'Geen account gevonden met deze gegevens.';
  } else if (error.message.includes('Invalid grant')) {
    errorMessage = 'Ongeldige inloggegevens. Controleer je gegevens en probeer opnieuw.';
  }
  
  toast.error(errorMessage);
};