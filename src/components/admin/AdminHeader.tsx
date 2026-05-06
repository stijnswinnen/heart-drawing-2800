import { useSession } from "@supabase/auth-helpers-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cleanupAuthState } from "@/utils/authCleanup";

export const AdminHeader = () => {
  const session = useSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      cleanupAuthState();
      try {
        await supabase.auth.signOut({ scope: "global" });
      } catch (error: any) {
        if (!error?.message?.includes("session_not_found")) {
          console.error("Logout error:", error);
        }
      }
      toast.success("Logged out successfully");
      setTimeout(() => {
        window.location.href = "/auth";
      }, 100);
    } catch (error) {
      console.error("Unexpected error during logout:", error);
      cleanupAuthState();
      window.location.href = "/auth";
    }
  };

  if (!session) return null;

  const email = session.user.email || "";
  const initial = (email[0] || "A").toUpperCase();

  return (
    <header
      className="sticky top-0 z-50 border-b border-line"
      style={{
        background: "rgba(251,250,247,0.85)",
        backdropFilter: "saturate(140%) blur(10px)",
        WebkitBackdropFilter: "saturate(140%) blur(10px)",
      }}
    >
      <div className="max-w-[1500px] mx-auto h-16 px-7 flex items-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-sans font-semibold tracking-[-0.01em] text-[15px] text-ink"
        >
          <span className="w-2 h-2 rounded-full bg-pink-500" aria-hidden="true" />
          <span>
            2800<span className="opacity-50">.love</span>
          </span>
        </Link>

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          <div className="text-right leading-tight">
            <div className="text-[13px] font-medium text-ink">{email}</div>
            <div className="text-[12px] text-ink-muted">
              Admin <span className="text-ink-muted">·</span>{" "}
              <button
                onClick={handleLogout}
                className="text-pink-500 hover:underline"
              >
                Logout
              </button>
            </div>
          </div>
          <div
            className="w-9 h-9 rounded-full bg-ink text-white flex items-center justify-center font-serif text-[15px]"
            aria-hidden="true"
          >
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
};
