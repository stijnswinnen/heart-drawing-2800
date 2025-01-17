import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Mail, CheckCircle2, XCircle, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const PersonalInfoSection = () => {
  const session = useSession();
  const supabase = useSupabaseClient();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      if (error || !currentSession) {
        console.error('Session error:', error);
        navigate('/');
        return;
      }
      
      if (currentSession?.user?.user_metadata?.name) {
        setName(currentSession.user.user_metadata.name);
      }
    };

    checkSession();
  }, [supabase.auth, navigate]);

  const isVerified = session?.user?.email_confirmed_at !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { name }
      });

      if (error) throw error;

      toast.success("Je profiel is bijgewerkt.");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Profiel bijwerken mislukt. Probeer het opnieuw.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResendingVerification(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: session?.user?.email || '',
        options: {
          emailRedirectTo: `${window.location.origin}/verify`,
        },
      });

      if (error) throw error;

      toast.success("Een nieuwe verificatie e-mail is verzonden. Check je inbox.");
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error("Er ging iets mis bij het verzenden van de verificatie e-mail. Probeer het later opnieuw.");
    } finally {
      setIsResendingVerification(false);
    }
  };

  if (!session?.user) {
    return null;
  }

  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-primary-dark">Persoonlijke Informatie</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Naam</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jouw naam"
              className="border-primary/20 focus:border-primary-dark"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">E-mailadres</Label>
            <div className="space-y-2">
              <Input 
                value={session?.user?.email || ""} 
                type="email" 
                disabled 
                className="bg-gray-50 border-primary/20"
              />
              <div className="flex items-center gap-2 text-sm">
                {isVerified ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-green-600">E-mailadres geverifieerd</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-red-600">E-mailadres niet geverifieerd</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResendVerification}
                      disabled={isResendingVerification}
                      className="ml-2"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      {isResendingVerification ? "Verzenden..." : "Verificatie e-mail opnieuw versturen"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary-dark hover:bg-primary-light text-white transition-colors duration-300"
            >
              {isLoading ? "Opslaan..." : "Wijzigingen Opslaan"}
            </Button>
            <Link 
              to="/reset-password"
              className="w-full"
            >
              <Button
                type="button"
                variant="outline"
                className="w-full border-primary/20"
              >
                <Lock className="mr-2 h-4 w-4" />
                Wachtwoord wijzigen
              </Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};