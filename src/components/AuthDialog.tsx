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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Check if user is admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        toast.success('Successfully signed in!');
        onClose();

        if (profile?.role === 'admin') {
          navigate('/admin');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [onClose, navigate]);

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
          redirectTo={window.location.origin}
        />
      </div>
    </div>
  );
};