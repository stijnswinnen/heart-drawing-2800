import { useSession } from "@supabase/auth-helpers-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, PlusCircle, Clock } from "lucide-react";
import { useApprovedHearts } from "@/hooks/useApprovedHearts";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

export const HeartSection = () => {
  const session = useSession();
  const approvedHearts = useApprovedHearts();
  const [pendingHeartUrl, setPendingHeartUrl] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProfileId = async () => {
      if (session?.user?.email) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', session.user.email)
            .maybeSingle();
          
          if (error && error.code !== 'PGRST116') {
            console.error('Error fetching profile:', error);
            return;
          }

          setProfileId(profile?.id || null);
        } catch (error) {
          console.error('Error in fetchProfileId:', error);
        }
      }
    };

    fetchProfileId();
  }, [session?.user?.email]);

  const userHeart = approvedHearts.find(
    (heart) => 
      (heart.user_id === session?.user.id || heart.heart_user_id === profileId) && 
      heart.status === "approved"
  );

  const pendingHeart = approvedHearts.find(
    (heart) => 
      (heart.user_id === session?.user.id || heart.heart_user_id === profileId) && 
      heart.status === "new"
  );

  useEffect(() => {
    const fetchPendingHeartUrl = async () => {
      if (pendingHeart?.image_path) {
        try {
          const { data } = supabase.storage
            .from('hearts')
            .getPublicUrl(pendingHeart.image_path);
          
          if (data?.publicUrl) {
            setPendingHeartUrl(data.publicUrl);
          }
        } catch (error) {
          console.error('Error fetching pending heart URL:', error);
        }
      }
    };

    fetchPendingHeartUrl();
  }, [pendingHeart?.image_path]);

  const getHeartImageUrl = (imagePath: string, status: "approved" | "new") => {
    const bucket = status === "approved" ? "optimized" : "hearts";
    const { data } = supabase.storage.from(bucket).getPublicUrl(imagePath);
    return data.publicUrl;
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Mijn Hart
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingHeart ? (
          <div className="space-y-4">
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Je tekening wordt momenteel beoordeeld. Je krijgt een e-mail zodra deze is goedgekeurd.
              </AlertDescription>
            </Alert>
            {pendingHeartUrl && (
              <div className="aspect-square w-full max-w-md mx-auto relative">
                <Badge className="absolute top-4 right-4 bg-yellow-500">
                  Wacht op goedkeuring
                </Badge>
                <img
                  src={getHeartImageUrl(pendingHeart.image_path, "new")}
                  alt="Je wachtende hart"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
        ) : userHeart ? (
          <div className="aspect-square w-full max-w-md mx-auto">
            <img
              src={getHeartImageUrl(userHeart.image_path, "approved")}
              alt="Jouw hart"
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="text-center p-8">
            <p className="text-muted-foreground mb-4">
              Je hebt nog geen hart gemaakt
            </p>
            <Button asChild>
              <Link to="/hearts">
                <PlusCircle className="mr-2 h-4 w-4" />
                Maak Je Hart
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};