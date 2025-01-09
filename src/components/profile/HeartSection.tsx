import { useSession } from "@supabase/auth-helpers-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, PlusCircle, Clock } from "lucide-react";
import { useApprovedHearts } from "@/hooks/useApprovedHearts";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const HeartSection = () => {
  const session = useSession();
  const approvedHearts = useApprovedHearts();
  
  const userHeart = approvedHearts.find(
    (heart) => heart.user_id === session?.user.id
  );

  const pendingHeart = approvedHearts.find(
    (heart) => heart.user_id === session?.user.id && heart.status === "new"
  );

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
            <div className="aspect-square w-full max-w-md mx-auto">
              <img
                src={pendingHeart.image_path}
                alt="Je wachtende hart"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        ) : userHeart ? (
          <div className="aspect-square w-full max-w-md mx-auto">
            <img
              src={userHeart.image_path}
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