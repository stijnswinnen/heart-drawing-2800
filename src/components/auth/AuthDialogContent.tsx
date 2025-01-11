import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from "react";
import { handleAuthError } from "./AuthErrorHandler";

interface AuthDialogContentProps {
  onClose: () => void;
}

export const AuthDialogContent = ({ onClose }: AuthDialogContentProps) => {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        toast.success('Succesvol ingelogd!');
        onClose();
      } else if (event === 'USER_UPDATED') {
        try {
          const { error } = await supabase.auth.getSession();
          if (error) {
            handleAuthError(error);
          }
        } catch (error: any) {
          console.error('Session check error:', error);
          handleAuthError(error);
        }
      } else if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery initiated');
      }
    });

    return () => subscription.unsubscribe();
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-white/95 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#F26D85',
                  brandAccent: '#F29BA2',
                }
              }
            }
          }}
          providers={[]}
          showLinks={true}
          view="sign_in"
          redirectTo={`${window.location.origin}/reset-password`}
          localization={{
            variables: {
              sign_in: {
                email_label: 'E-mailadres',
                password_label: 'Wachtwoord',
                button_label: 'Inloggen',
                loading_button_label: 'Inloggen...',
                social_provider_text: 'Inloggen met {{provider}}',
                link_text: 'Heb je al een account? Log in',
              },
              sign_up: {
                email_label: 'E-mailadres',
                password_label: 'Wachtwoord',
                button_label: 'Registreren',
                loading_button_label: 'Registreren...',
                social_provider_text: 'Registreren met {{provider}}',
                link_text: 'Nog geen account? Registreer je',
              },
              forgotten_password: {
                email_label: 'E-mailadres',
                password_label: 'Wachtwoord',
                button_label: 'Stuur wachtwoord reset link',
                loading_button_label: 'Link wordt verstuurd...',
                link_text: 'Wachtwoord vergeten?',
                confirmation_text: 'Check je e-mail voor de wachtwoord reset link',
              },
            },
          }}
        />
      </div>
    </div>
  );
};