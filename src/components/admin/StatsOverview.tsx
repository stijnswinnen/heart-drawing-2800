import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, MapPin, ThumbsUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export const StatsOverview = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [
        { count: approvedHearts },
        { count: totalLocations },
        { count: totalLikes },
        { count: totalUsers },
        { count: marketingConsent },
      ] = await Promise.all([
        supabase
          .from("drawings")
          .select("*", { count: "exact", head: true })
          .eq("status", "approved"),
        supabase
          .from("locations")
          .select("*", { count: "exact", head: true })
          .eq("status", "approved"),
        supabase
          .from("location_likes")
          .select("*", { count: "exact", head: true })
          .eq("status", "active"),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("marketing_consent", true),
      ]);

      return {
        approvedHearts,
        totalLocations,
        totalLikes,
        totalUsers,
        marketingConsent,
      };
    },
  });

  const statCards = [
    {
      title: "Approved Hearts",
      value: stats?.approvedHearts ?? 0,
      icon: Heart,
      color: "text-red-500",
    },
    {
      title: "Total Locations",
      value: stats?.totalLocations ?? 0,
      icon: MapPin,
      color: "text-blue-500",
    },
    {
      title: "Active Likes",
      value: stats?.totalLikes ?? 0,
      icon: ThumbsUp,
      color: "text-green-500",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={cn("h-4 w-4", stat.color)} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};