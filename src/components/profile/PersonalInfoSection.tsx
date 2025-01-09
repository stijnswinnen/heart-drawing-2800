import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export const PersonalInfoSection = () => {
  const session = useSession();
  const supabase = useSupabaseClient();
  const { toast } = useToast();
  const [name, setName] = useState(session?.user?.user_metadata?.name || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { name }
      });

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Je profiel is bijgewerkt.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Fout",
        description: "Profiel bijwerken mislukt. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Persoonlijke Informatie</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Naam</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jouw naam"
            />
          </div>
          <div>
            <Label>E-mailadres</Label>
            <Input value={session?.user.email || ""} type="email" disabled />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Opslaan..." : "Wijzigingen Opslaan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};