import { useEffect } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AuthDialogProps {
  onClose: () => void;
}

export const AuthDialog = ({ onClose }: AuthDialogProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    // First check if there's an existing session
    const checkSession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        // If there's a refresh token error, clear the session
        if (sessionError.message.includes('refresh_token_not_found')) {
          await supabase.auth.signOut();
          toast.error('Your session has expired. Please sign in again.');
        }
      }
      
      if (session?.user) {
        handleSignedInUser(session.user);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session?.user?.id) {
        handleSignedInUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      }
    });

    return () => subscription.unsubscribe();
  }, [onClose, navigate]);

  const handleSignedInUser = async (user: any) => {
    try {
      // Check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast.error('Error checking user role');
        return;
      }

      // Try to link existing heart_user if exists
      const { data: heartUser, error: linkError } = await supabase
        .from('heart_users')
        .update({ user_id: user.id })
        .eq('email', user.email)
        .select()
        .single();

      if (linkError) {
        console.log('No existing heart_user to link:', linkError);
      } else if (heartUser) {
        console.log('Linked existing heart_user to auth account:', heartUser);
      }

      toast.success('Successfully signed in!');
      onClose();

      if (profile?.role === 'admin') {
        navigate('/admin');
      }
    } catch (error) {
      console.error('Error in auth state change:', error);
      toast.error('An error occurred during sign in');
    }
  };

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
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          showLinks={true}
          view="sign_in"
          redirectTo={window.location.origin}
        />
      </div>
    </div>
  );
};