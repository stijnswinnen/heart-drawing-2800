import { useSession } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type DrawingStatus = "new" | "approved";

const Admin = () => {
  const session = useSession();
  const navigate = useNavigate();
  const [selectedStatus, setSelectedStatus] = useState<DrawingStatus>("new");

  // Fetch profile to check admin status
  const { data: profile } = useQuery({
    queryKey: ["profile", session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session?.user?.id)
        .single();
      return data;
    },
  });

  // Fetch drawings based on selected status
  const { data: drawings } = useQuery({
    queryKey: ["drawings", selectedStatus],
    queryFn: async () => {
      const { data } = await supabase
        .from("drawings")
        .select("*")
        .eq("status", selectedStatus)
        .order("created_at", { ascending: false });
      return data as Tables<"drawings">[] | null;
    },
  });

  // Redirect non-admin users
  useEffect(() => {
    if (!session) {
      navigate("/");
    } else if (profile && profile.role !== "admin") {
      navigate("/");
    }
  }, [session, profile, navigate]);

  if (!profile || profile.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold">2800</span>
            <Heart className="text-red-500" />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-medium">{profile.name}</div>
              <div className="text-sm text-muted-foreground">Admin</div>
            </div>
            <Avatar>
              <AvatarFallback>
                {profile.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <h2 className="font-medium mb-4">Hearts</h2>
            <nav className="space-y-2">
              <button
                onClick={() => setSelectedStatus("new")}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between ${
                  selectedStatus === "new"
                    ? "bg-zinc-900 text-white"
                    : "hover:bg-zinc-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Heart
                    className={selectedStatus === "new" ? "text-red-500" : ""}
                    size={20}
                  />
                  <span>New</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {drawings?.filter((d) => d.status === "new").length || 0} hearts
                </span>
              </button>
              <button
                onClick={() => setSelectedStatus("approved")}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between ${
                  selectedStatus === "approved"
                    ? "bg-zinc-900 text-white"
                    : "hover:bg-zinc-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Heart
                    className={selectedStatus === "approved" ? "text-green-500" : ""}
                    size={20}
                  />
                  <span>Approved</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {drawings?.filter((d) => d.status === "approved").length || 0} hearts
                </span>
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            <div className="grid grid-cols-2 gap-6">
              {drawings?.map((drawing) => (
                <div
                  key={drawing.id}
                  className="border border-dashed rounded-lg p-4 aspect-square"
                >
                  <img
                    src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/hearts/${
                      drawing.image_path
                    }`}
                    alt="Heart drawing"
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Admin;