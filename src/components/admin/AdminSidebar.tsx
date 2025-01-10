import { Heart, MapPin, BarChart3, Users } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";

interface AdminSidebarProps {
  selectedStatus: "new" | "approved";
  setSelectedStatus: (status: "new" | "approved") => void;
  drawings: Tables<"drawings">[] | null;
}

export const AdminSidebar = ({ selectedStatus, setSelectedStatus, drawings }: AdminSidebarProps) => {
  const location = useLocation();

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
    </Sidebar>
  );
};