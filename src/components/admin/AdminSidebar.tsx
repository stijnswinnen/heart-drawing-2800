import { Heart } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

interface AdminSidebarProps {
  selectedStatus: "new" | "approved";
  setSelectedStatus: (status: "new" | "approved") => void;
  drawings: Tables<"drawings">[] | null;
}

export const AdminSidebar = ({ selectedStatus, setSelectedStatus, drawings }: AdminSidebarProps) => {
  const newDrawingsCount = drawings?.filter(d => d.status === "new").length || 0;
  const approvedDrawingsCount = drawings?.filter(d => d.status === "approved").length || 0;

  return (
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
            {newDrawingsCount} hearts
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
            {approvedDrawingsCount} hearts
          </span>
        </button>
      </nav>
    </aside>
  );
};