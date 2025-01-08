import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { handleAuthError } from "./AuthErrorHandler";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useAuthStateChange = (onClose: () => void) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
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
      } else if (event === 'USER_UPDATED') {
        const { error } = await supabase.auth.getSession();
        if (error) {
          handleAuthError(error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [onClose, navigate]);

  const handleSignedInUser = async (user: any) => {
    try {
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
    } catch (error: any) {
      console.error('Error in auth state change:', error);
      handleAuthError(error);
    }
  };

  return { handleSignedInUser };
};