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
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="font-montserrat text-primary-dark">Persoonlijke Informatie</CardTitle>
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
            <Input 
              value={session?.user.email || ""} 
              type="email" 
              disabled 
              className="bg-gray-50 border-primary/20"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary-dark hover:bg-primary-light text-white transition-colors duration-300"
          >
            {isLoading ? "Opslaan..." : "Wijzigingen Opslaan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};