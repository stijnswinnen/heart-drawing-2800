import { Heart, MapPin, VideoIcon, Tag, Users } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type AdminStatus = "new" | "approved" | "pending_verification" | "rejected";
type AdminSection = "hearts" | "locations" | "videos" | "categories" | "users";

interface AdminSidebarProps {
  selectedStatus: AdminStatus;
  selectedSection: AdminSection;
  setSelectedStatus: (status: AdminStatus) => void;
  setSelectedSection: (section: AdminSection) => void;
  drawings: Tables<"drawings">[] | null;
  locations: Tables<"locations">[] | null;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}

const NavItem = ({ icon, label, count, active, onClick }: NavItemProps) => (
  <button
    data-admin-nav
    data-active={active ? "true" : "false"}
    onClick={onClick}
    className={`w-full flex items-center gap-2 px-3 py-[9px] rounded-full text-[14px] font-sans transition-colors ${
      active
        ? "bg-ink text-white"
        : "bg-transparent text-ink-2 hover:bg-bg hover:text-ink"
    }`}
  >
    <span className="w-4 h-4 inline-flex items-center justify-center shrink-0">
      {icon}
    </span>
    <span className="flex-1 text-left">{label}</span>
    {typeof count === "number" && (
      <span
        className={`text-[12px] tabular-nums ${
          active ? "text-white/65" : "text-ink-muted"
        }`}
      >
        {count}
      </span>
    )}
  </button>
);

const GroupLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="font-serif font-medium text-[15px] text-ink px-3 mb-1.5">
    {children}
  </div>
);

export const AdminSidebar = ({
  selectedStatus,
  selectedSection,
  setSelectedStatus,
  setSelectedSection,
  drawings,
  locations,
}: AdminSidebarProps) => {
  const newDrawings = drawings?.filter(d => d.status === "new").length || 0;
  const approvedDrawings = drawings?.filter(d => d.status === "approved").length || 0;
  const newLocations = locations?.filter(l => l.status === "new").length || 0;
  const approvedLocations = locations?.filter(l => l.status === "approved").length || 0;
  const pendingLocations = locations?.filter(l => l.status === "pending_verification").length || 0;
  const rejectedLocations = locations?.filter(l => l.status === "rejected").length || 0;

  const isHearts = (s: AdminStatus) =>
    selectedSection === "hearts" && selectedStatus === s;
  const isLocations = (s: AdminStatus) =>
    selectedSection === "locations" && selectedStatus === s;

  return (
    <aside className="lg:sticky lg:top-16 lg:self-start lg:h-[calc(100vh-64px)] lg:overflow-y-auto px-4 py-8 border-b lg:border-b-0 lg:border-r border-line">
      <div className="space-y-7">
        <div>
          <GroupLabel>Hartjes</GroupLabel>
          <div className="space-y-1">
            <NavItem
              icon={<Heart className="w-4 h-4" strokeWidth={1.75} />}
              label="New"
              count={newDrawings}
              active={isHearts("new")}
              onClick={() => {
                setSelectedSection("hearts");
                setSelectedStatus("new");
              }}
            />
            <NavItem
              icon={<Heart className="w-4 h-4" strokeWidth={1.75} />}
              label="Approved"
              count={approvedDrawings}
              active={isHearts("approved")}
              onClick={() => {
                setSelectedSection("hearts");
                setSelectedStatus("approved");
              }}
            />
          </div>
        </div>

        <div>
          <GroupLabel>Plekken</GroupLabel>
          <div className="space-y-1">
            <NavItem
              icon={<MapPin className="w-4 h-4" strokeWidth={1.75} />}
              label="New"
              count={newLocations}
              active={isLocations("new")}
              onClick={() => {
                setSelectedSection("locations");
                setSelectedStatus("new");
              }}
            />
            <NavItem
              icon={<MapPin className="w-4 h-4" strokeWidth={1.75} />}
              label="Approved"
              count={approvedLocations}
              active={isLocations("approved")}
              onClick={() => {
                setSelectedSection("locations");
                setSelectedStatus("approved");
              }}
            />
            <NavItem
              icon={<MapPin className="w-4 h-4" strokeWidth={1.75} />}
              label="Pending verification"
              count={pendingLocations}
              active={isLocations("pending_verification")}
              onClick={() => {
                setSelectedSection("locations");
                setSelectedStatus("pending_verification");
              }}
            />
            <NavItem
              icon={<MapPin className="w-4 h-4" strokeWidth={1.75} />}
              label="Rejected"
              count={rejectedLocations}
              active={isLocations("rejected")}
              onClick={() => {
                setSelectedSection("locations");
                setSelectedStatus("rejected");
              }}
            />
            <NavItem
              icon={<Tag className="w-4 h-4" strokeWidth={1.75} />}
              label="Categories"
              active={selectedSection === "categories"}
              onClick={() => setSelectedSection("categories")}
            />
          </div>
        </div>

        <div>
          <GroupLabel>Gebruikers</GroupLabel>
          <div className="space-y-1">
            <NavItem
              icon={<Users className="w-4 h-4" strokeWidth={1.75} />}
              label="Management"
              active={selectedSection === "users"}
              onClick={() => setSelectedSection("users")}
            />
          </div>
        </div>

        <div>
          <GroupLabel>Video's</GroupLabel>
          <div className="space-y-1">
            <NavItem
              icon={<VideoIcon className="w-4 h-4" strokeWidth={1.75} />}
              label="Management"
              active={selectedSection === "videos"}
              onClick={() => setSelectedSection("videos")}
            />
          </div>
        </div>
      </div>
    </aside>
  );
};
