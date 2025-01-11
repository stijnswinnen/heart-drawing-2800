import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { handleAuthError } from "./AuthErrorHandler";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useAuthStateChange = (onClose: () => void) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (sessionError.message.includes('refresh_token_not_found')) {
            await supabase.auth.signOut();
            toast.error('Je sessie is verlopen. Log opnieuw in.');
          } else {
            handleAuthError(sessionError);
          }
        }
        
        if (session?.user) {
          handleSignedInUser(session.user);
        }
      } catch (error: any) {
        console.error('Session check error:', error);
        handleAuthError(error);
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
      } else if (event === 'USER_UPDATED') {
        try {
          const { error } = await supabase.auth.getSession();
          if (error) {
            handleAuthError(error);
          }
        } catch (error: any) {
          console.error('Session update error:', error);
          handleAuthError(error);
        }
      } else if (event === 'PASSWORD_RECOVERY') {
        toast.success('Check je e-mail voor instructies om je wachtwoord te resetten.');
      }
    });

    return () => subscription.unsubscribe();
  }, [onClose, navigate]);

  const handleSignedInUser = async (user: any) => {
    try {
      // First check if profile exists by user ID
      const { data: profileById, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
        toast.error('Error bij het controleren van de gebruikersrol');
        return;
      }

      // If profile exists by ID, handle admin navigation
      if (profileById?.role === 'admin') {
        navigate('/admin');
        onClose();
        return;
      }

      // Try to link existing profile by email if it exists
      const { data: heartUser, error: linkError } = await supabase
        .from('profiles')
        .update({ 
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0]
        })
        .eq('email', user.email)
        .select()
        .maybeSingle();

      if (linkError && linkError.code !== 'PGRST116') {
        console.error('Error linking profile:', linkError);
      } else if (heartUser) {
        console.log('Linked existing profile to auth account:', heartUser);
      }

      toast.success('Succesvol ingelogd!');
      onClose();

    } catch (error: any) {
      console.error('Error in auth state change:', error);
      handleAuthError(error);
    }
  };

  return { handleSignedInUser };
};