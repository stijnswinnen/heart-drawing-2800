import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { handleAuthError } from "./AuthErrorHandler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthDialogContentProps {
  onClose: () => void;
}

export const AuthDialogContent = ({ onClose }: AuthDialogContentProps) => {
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);

      if (event === 'SIGNED_IN' && session?.user) {
        toast.success('Succesvol ingelogd!');
        onClose();
      } else if (event === 'USER_UPDATED') {
        try {
          const { error } = await supabase.auth.getSession();
          if (error) handleAuthError(error);
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

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Voer een e-mailadres in');
      return;
    }
    setResetLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-password-reset', {
        body: {
          email: resetEmail,
          redirectTo: `${window.location.origin}/reset-password`,
        },
      });
      if (error) throw error;
      toast.success('Als er een account bestaat, ontvang je zo dadelijk een e-mail.');
      setResetEmail('');
      setShowForgot(false);
    } catch (err) {
      console.error('Password reset error:', err);
      toast.error('Er ging iets mis. Probeer het later opnieuw.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/95 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>

        {showForgot ? (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <h2 className="text-lg font-semibold">Wachtwoord vergeten</h2>
            <div className="space-y-2">
              <Label htmlFor="reset-email">E-mailadres</Label>
              <Input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="je@email.com"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={resetLoading}>
              {resetLoading ? 'Link wordt verstuurd...' : 'Stuur wachtwoord reset link'}
            </Button>
            <button
              type="button"
              onClick={() => setShowForgot(false)}
              className="text-sm text-muted-foreground hover:text-foreground w-full text-center"
            >
              Terug naar inloggen
            </button>
          </form>
        ) : (
          <>
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#F26D85',
                      brandAccent: '#F29BA2',
                    },
                  },
                },
              }}
              providers={[]}
              showLinks={false}
              view="sign_in"
              redirectTo={window.location.origin}
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
                },
              }}
            />
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                Wachtwoord vergeten?
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
