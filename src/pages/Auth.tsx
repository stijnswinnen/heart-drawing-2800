import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cleanupAuthState } from "@/utils/authCleanup";

const AuthPage = () => {
  const session = useSession();
  const navigate = useNavigate();
  const [view, setView] = useState<'sign_in' | 'sign_up' | 'forgotten_password' | 'magic_link'>('sign_in');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (session) {
      navigate('/admin');
    }
  }, [session, navigate]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        toast.success('Succesvol ingelogd!');
        navigate('/admin');
      } else if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery initiated');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleCleanLogin = async () => {
    try {
      cleanupAuthState();
      await supabase.auth.signOut({ scope: 'global' });
      toast.success('Auth state cleared. Please try logging in again.');
    } catch (error) {
      console.error('Cleanup error:', error);
      toast.error('Cleanup completed');
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      toast.error('Voer een e-mailadres in');
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });
      
      if (error) throw error;
      toast.success('Magic link verzonden! Check je e-mail.');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground">Aan het laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug naar home
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold">2800</span>
            <Heart className="text-red-500" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-card p-8 rounded-lg shadow-lg border">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-semibold mb-2">
                {view === 'sign_up' ? 'Account aanmaken' : 
                 view === 'forgotten_password' ? 'Wachtwoord vergeten' :
                 view === 'magic_link' ? 'Magic Link Login' : 'Inloggen'}
              </h1>
              <p className="text-muted-foreground">
                {view === 'sign_up' ? 'Maak een nieuw account aan' : 
                 view === 'forgotten_password' ? 'Reset je wachtwoord' :
                 view === 'magic_link' ? 'Log in met een magic link' : 'Log in op je account'}
              </p>
            </div>

            {view === 'magic_link' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    E-mailadres
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="je@email.com"
                  />
                </div>
                <Button onClick={handleMagicLink} className="w-full">
                  Verstuur Magic Link
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setView('sign_in')}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Terug naar normale login
                  </button>
                </div>
              </div>
            ) : (
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
                view={view}
                redirectTo={`${window.location.origin}/admin`}
                localization={{
                  variables: {
                    sign_in: {
                      email_label: 'E-mailadres',
                      password_label: 'Wachtwoord',
                      button_label: 'Inloggen',
                      loading_button_label: 'Inloggen...',
                      link_text: 'Heb je al een account? Log in',
                    },
                    sign_up: {
                      email_label: 'E-mailadres',
                      password_label: 'Wachtwoord',
                      button_label: 'Registreren',
                      loading_button_label: 'Registreren...',
                      link_text: 'Nog geen account? Registreer je',
                    },
                    forgotten_password: {
                      email_label: 'E-mailadres',
                      button_label: 'Stuur wachtwoord reset link',
                      loading_button_label: 'Link wordt verstuurd...',
                      link_text: 'Wachtwoord vergeten?',
                      confirmation_text: 'Check je e-mail voor de wachtwoord reset link',
                    },
                  },
                }}
              />
            )}

            {/* Alternative Login Options */}
            <div className="mt-6 pt-6 border-t">
              <div className="flex flex-col gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setView(view === 'magic_link' ? 'sign_in' : 'magic_link')}
                  className="w-full"
                >
                  {view === 'magic_link' ? 'Normale Login' : 'Magic Link Login'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleCleanLogin}
                  className="w-full text-xs"
                >
                  Login problemen? Reset auth state
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;