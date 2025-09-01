import { Heart, MapPin, VideoIcon, Tag } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

interface AdminSidebarProps {
  selectedStatus: "new" | "approved" | "pending_verification";
  selectedSection: "hearts" | "locations" | "videos" | "categories";
  setSelectedStatus: (status: "new" | "approved" | "pending_verification") => void;
  setSelectedSection: (section: "hearts" | "locations" | "videos" | "categories") => void;
  drawings: Tables<"drawings">[] | null;
  locations: Tables<"locations">[] | null;
}

export const AdminSidebar = ({ 
  selectedStatus, 
  selectedSection,
  setSelectedStatus, 
  setSelectedSection,
  drawings,
  locations 
}: AdminSidebarProps) => {
  const newDrawingsCount = drawings?.filter(drawing => drawing.status === "new").length || 0;
  const approvedDrawingsCount = drawings?.filter(drawing => drawing.status === "approved").length || 0;
  const newLocationsCount = locations?.filter(location => location.status === "new").length || 0;
  const approvedLocationsCount = locations?.filter(location => location.status === "approved").length || 0;
  const pendingLocationsCount = locations?.filter(location => location.status === "pending_verification").length || 0;

  return (
    <aside className="w-64 flex-shrink-0">
      <div className="space-y-6">
        <div>
          <h2 className="font-medium mb-4">Hearts</h2>
          <nav className="space-y-2">
            <button
              onClick={() => {
                setSelectedSection("hearts");
                setSelectedStatus("new");
              }}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between ${
                selectedSection === "hearts" && selectedStatus === "new"
                  ? "bg-zinc-900 text-white"
                  : "hover:bg-zinc-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <Heart
                  className={selectedSection === "hearts" && selectedStatus === "new" ? "text-red-500" : ""}
                  size={20}
                />
                <span>New</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {newDrawingsCount} hearts
              </span>
            </button>
            <button
              onClick={() => {
                setSelectedSection("hearts");
                setSelectedStatus("approved");
              }}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between ${
                selectedSection === "hearts" && selectedStatus === "approved"
                  ? "bg-zinc-900 text-white"
                  : "hover:bg-zinc-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <Heart
                  className={selectedSection === "hearts" && selectedStatus === "approved" ? "text-green-500" : ""}
                  size={20}
                />
                <span>Approved</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {approvedDrawingsCount} hearts
              </span>
            </button>
          </nav>
        </div>

        <div>
          <h2 className="font-medium mb-4">Locations</h2>
          <nav className="space-y-2">
            <button
              onClick={() => {
                setSelectedSection("locations");
                setSelectedStatus("new");
              }}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between ${
                selectedSection === "locations" && selectedStatus === "new"
                  ? "bg-zinc-900 text-white"
                  : "hover:bg-zinc-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPin
                  className={selectedSection === "locations" && selectedStatus === "new" ? "text-red-500" : ""}
                  size={20}
                />
                <span>New</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {newLocationsCount} locations
              </span>
            </button>
            <button
              onClick={() => {
                setSelectedSection("locations");
                setSelectedStatus("approved");
              }}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between ${
                selectedSection === "locations" && selectedStatus === "approved"
                  ? "bg-zinc-900 text-white"
                  : "hover:bg-zinc-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPin
                  className={selectedSection === "locations" && selectedStatus === "approved" ? "text-green-500" : ""}
                  size={20}
                />
                <span>Approved</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {approvedLocationsCount} locations
              </span>
            </button>
            <button
              onClick={() => {
                setSelectedSection("locations");
                setSelectedStatus("pending_verification");
              }}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between ${
                selectedSection === "locations" && selectedStatus === "pending_verification"
                  ? "bg-zinc-900 text-white"
                  : "hover:bg-zinc-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPin
                  className={selectedSection === "locations" && selectedStatus === "pending_verification" ? "text-yellow-500" : ""}
                  size={20}
                />
                <span>Pending Verification</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {pendingLocationsCount} locations
              </span>
            </button>
            <button
              onClick={() => {
                setSelectedSection("categories");
              }}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between ${
                selectedSection === "categories"
                  ? "bg-zinc-900 text-white"
                  : "hover:bg-zinc-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <Tag
                  className={selectedSection === "categories" ? "text-purple-500" : ""}
                  size={20}
                />
                <span>Categories</span>
              </div>
            </button>
          </nav>
        </div>

        <div>
          <h2 className="font-medium mb-4">Videos</h2>
          <nav className="space-y-2">
            <button
              onClick={() => {
                setSelectedSection("videos");
              }}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between ${
                selectedSection === "videos"
                  ? "bg-zinc-900 text-white"
                  : "hover:bg-zinc-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <VideoIcon
                  className={selectedSection === "videos" ? "text-blue-500" : ""}
                  size={20}
                />
                <span>Management</span>
              </div>
            </button>
          </nav>
        </div>
      </div>
    </aside>
  );
};