import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if we have a valid access token
    const checkToken = async () => {
      const accessToken = searchParams.get("access_token");
      if (!accessToken) {
        toast.error("Geen geldige reset link");
        navigate("/");
        return;
      }

      const { error } = await supabase.auth.getUser(accessToken);
      if (error) {
        toast.error("De reset link is verlopen");
        navigate("/");
      }
    };

    checkToken();
  }, [searchParams, navigate]);

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
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 to-white p-4">
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