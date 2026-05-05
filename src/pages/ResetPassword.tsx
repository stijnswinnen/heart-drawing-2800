import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Seo } from "@/components/Seo";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);

  useEffect(() => {
    let resolved = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let mounted = true;

    const accept = () => {
      if (!mounted || resolved) return;
      resolved = true;
      if (timeoutId) clearTimeout(timeoutId);
      setValidatingToken(false);
    };

    const reject = () => {
      if (!mounted || resolved) return;
      resolved = true;
      if (timeoutId) clearTimeout(timeoutId);
      toast.error("Ongeldige of verlopen reset link");
      navigate("/");
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION"))) {
        accept();
      }
    });

    const url = new URL(window.location.href);
    const tokenHash = url.searchParams.get("token_hash");
    const type = url.searchParams.get("type");

    if (tokenHash && type === "recovery") {
      supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash })
        .then(({ error }) => {
          if (error) {
            console.error("Recovery token exchange error:", error);
            reject();
            return;
          }
          url.searchParams.delete("token_hash");
          url.searchParams.delete("type");
          window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
          accept();
        })
        .catch((error) => {
          console.error("Recovery token verification failed:", error);
          reject();
        });
    }

    // Fallback: hash may already have been processed before subscription
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) accept();
    });

    // Grace period to allow detectSessionInUrl to parse the recovery hash
    timeoutId = setTimeout(() => {
      reject();
    }, 3000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });

      if (error) throw error;

      toast.success("Wachtwoord succesvol gewijzigd");
      navigate("/profile");
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error(error.message || "Er ging iets mis bij het wijzigen van je wachtwoord");
    } finally {
      setLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 to-white p-4">
        <div className="text-center">
          <p>Reset link valideren...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 to-white p-4">
      <Seo title="Wachtwoord vergeten · 2800.love" path="/reset-password" noindex />
      <div className="w-full max-w-md space-y-8 bg-white p-6 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Reset je wachtwoord</h1>
          <p className="text-gray-600 mt-2">Voer je nieuwe wachtwoord in</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">Nieuw wachtwoord</Label>
            <Input
              id="password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Voer je nieuwe wachtwoord in"
              required
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Bezig met opslaan..." : "Wachtwoord opslaan"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;