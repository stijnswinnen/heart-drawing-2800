import { useSession } from "@supabase/auth-helpers-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const PersonalInfoSection = () => {
  const session = useSession();

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input value={session?.user.email || ""} type="email" disabled />
          </div>
          <Button>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  );
};