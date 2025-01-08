import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";

interface AuthDialogContentProps {
  onClose: () => void;
}

export const AuthDialogContent = ({ onClose }: AuthDialogContentProps) => {
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