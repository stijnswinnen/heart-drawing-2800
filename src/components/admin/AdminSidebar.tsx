import { Heart, MapPin, BarChart3, Users, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdminSidebarProps {
  selectedStatus: "new" | "approved";
  setSelectedStatus: (status: "new" | "approved") => void;
  drawings: Tables<"drawings">[] | null;
}

export const AdminSidebar = ({ selectedStatus, setSelectedStatus, drawings }: AdminSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Je bent uitgelogd");
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Er ging iets mis bij het uitloggen");
    }
  };

  const menuItems = [
    {
      label: "Hearts",
      items: [
        {
          title: "New Hearts",
          url: "/admin",
          icon: Heart,
          activePattern: /^\/admin$/,
          onClick: () => setSelectedStatus("new"),
          isActive: selectedStatus === "new" && location.pathname === "/admin",
        },
        {
          title: "Approved Hearts",
          url: "/admin/approved-hearts",
          icon: Heart,
          activePattern: /^\/admin\/approved-hearts$/,
          onClick: () => setSelectedStatus("approved"),
          isActive: selectedStatus === "approved" || location.pathname === "/admin/approved-hearts",
        },
      ],
    },
    {
      label: "Locations",
      items: [
        {
          title: "All Locations",
          url: "/admin/locations",
          icon: MapPin,
          activePattern: /^\/admin\/locations$/,
        },
      ],
    },
    {
      label: "Analytics",
      items: [
        {
          title: "Statistics",
          url: "/admin/stats",
          icon: BarChart3,
          activePattern: /^\/admin\/stats$/,
        },
        {
          title: "Users",
          url: "/admin/users",
          icon: Users,
          activePattern: /^\/admin\/users$/,
        },
      ],
    },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        (item.isActive || item.activePattern.test(location.pathname)) &&
                          "bg-zinc-100 text-zinc-900"
                      )}
                      onClick={item.onClick}
                    >
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-zinc-200 p-4">
        {profile && (
          <div className="flex flex-col gap-4">
            <div className="text-sm">
              <div className="font-medium">{profile.email}</div>
              <div className="text-zinc-500">Admin</div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
            >
              <LogOut className="w-4 h-4" />
              <span>Uitloggen</span>
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};