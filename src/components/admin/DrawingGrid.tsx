import { Tables } from "@/integrations/supabase/types";
import { CheckCircle, XCircle, Mail, Clock, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { getStorageUrl } from "@/utils/imageUtils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { SectionHeader } from "./SectionHeader";

interface DrawingGridProps {
  drawings: Tables<"drawings">[] | null;
  selectedStatus: "new" | "approved" | "pending_verification";
  onApprove: (drawing: Tables<"drawings">) => Promise<void>;
  onDecline: (drawing: Tables<"drawings">) => Promise<void>;
}

interface Profile {
  email_verified: boolean;
  email: string;
  name: string | null;
}

const formatDateNL = (iso: string) => {
  try {
    return new Date(iso).toLocaleString("nl-BE", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const formatShortNL = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("nl-BE", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return iso;
  }
};

export const DrawingGrid = ({ drawings, selectedStatus, onApprove, onDecline }: DrawingGridProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!drawings?.length) return;
      const profileIds = drawings.map(d => d.heart_user_id).filter(Boolean) as string[];
      if (!profileIds.length) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email_verified, email, name")
        .in("id", profileIds);
      if (error) {
        console.error("Error fetching profiles:", error);
        return;
      }
      const profileMap = (data || []).reduce(
        (acc, p) => ({ ...acc, [p.id]: p }),
        {} as Record<string, Profile>,
      );
      setProfiles(profileMap);
    };
    fetchProfiles();
  }, [drawings]);

  const handleApprove = async (drawing: Tables<"drawings">) => {
    if (!drawing.heart_user_id || !profiles[drawing.heart_user_id]?.email_verified) {
      toast.error("Cannot approve drawing: Email not verified");
      return;
    }
    try {
      await onApprove(drawing);
    } catch (error) {
      console.error("Error in handleApprove:", error);
      toast.error("Failed to approve heart");
    }
  };

  const totalPages = drawings ? Math.ceil(drawings.length / itemsPerPage) : 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDrawings = drawings?.slice(startIndex, startIndex + itemsPerPage) || [];
  const total = drawings?.length || 0;

  if (selectedStatus === "approved") {
    return (
      <div className="w-full">
        <SectionHeader
          eyebrow="Goedgekeurd"
          title={`${total} ${total === 1 ? "hartje" : "hartjes"} in de collectie.`}
          description="Alle hartjes die zichtbaar zijn op 2800.love."
        />
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(180px,1fr))]">
          {currentDrawings.map((drawing) => {
            const profile = drawing.heart_user_id ? profiles[drawing.heart_user_id] : undefined;
            return (
              <div
                key={drawing.id}
                className="bg-surface border border-line rounded-[14px] p-4 transition-all hover:border-ink-2 hover:-translate-y-0.5"
              >
                <div
                  className="aspect-square bg-bg rounded-lg p-[18px] mb-3 flex items-center justify-center"
                >
                  <img
                    src={getStorageUrl(drawing.image_path, drawing.status)}
                    alt="Heart drawing"
                    className="max-w-full max-h-full object-contain"
                    style={{ filter: "brightness(0)" }}
                  />
                </div>
                <div className="flex items-center justify-between text-[12.5px] text-ink-muted">
                  <span className="truncate pr-2">{profile?.name || "Anoniem"}</span>
                  <span className="shrink-0">{formatShortNL(drawing.created_at)}</span>
                </div>
              </div>
            );
          })}
        </div>
        {totalPages > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    );
  }

  // "new" — moderation cards
  return (
    <div className="w-full">
      <SectionHeader
        eyebrow="Moderatie"
        title={total === 0 ? "Geen hartjes in afwachting." : "Hartjes in afwachting."}
        description="Beoordeel nieuwe hartjes en keur ze goed of af."
      />
      <div className="flex flex-col gap-4 max-w-[720px]">
        {currentDrawings.map((drawing) => {
          const profile = drawing.heart_user_id ? profiles[drawing.heart_user_id] : undefined;
          const verified = !!profile?.email_verified;
          return (
            <div
              key={drawing.id}
              className="bg-surface border border-line rounded-[20px] p-[22px] grid gap-6 md:[grid-template-columns:280px_1fr]"
            >
              <div className="border border-line rounded-[20px] aspect-square p-5 flex items-center justify-center">
                <img
                  src={getStorageUrl(drawing.image_path, drawing.status)}
                  alt="Heart drawing"
                  className="max-w-[180px] max-h-full object-contain"
                  style={{
                    filter:
                      "brightness(0) saturate(100%) invert(48%) sepia(57%) saturate(599%) hue-rotate(307deg) brightness(94%) contrast(86%)",
                  }}
                />
              </div>
              <div className="flex flex-col gap-3">
                {verified && (
                  <div className="self-start inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-full bg-green-50 text-green-700 text-[12.5px] font-medium">
                    <CheckCircle className="w-3.5 h-3.5" strokeWidth={2} />
                    E-mailadres geverifieerd
                  </div>
                )}
                {!verified && (
                  <div className="self-start inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-full bg-pink-50 text-pink-600 text-[12.5px] font-medium">
                    <XCircle className="w-3.5 h-3.5" strokeWidth={2} />
                    E-mail niet geverifieerd
                  </div>
                )}
                <div className="flex items-center gap-2 text-[14px] text-ink-2">
                  <Mail className="w-4 h-4 text-ink-muted" strokeWidth={1.75} />
                  <span className="truncate">{profile?.email || "—"}</span>
                </div>
                <div className="flex items-center gap-2 text-[14px] text-ink-2">
                  <Clock className="w-4 h-4 text-ink-muted" strokeWidth={1.75} />
                  <span>{formatDateNL(drawing.created_at)}</span>
                </div>
                <div className="flex gap-2 mt-auto pt-3">
                  <button
                    onClick={() => handleApprove(drawing)}
                    disabled={!verified}
                    className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-pink-500 text-white text-[14px] font-medium hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Check className="w-4 h-4" strokeWidth={2.25} />
                    Goedkeuren
                  </button>
                  <button
                    onClick={() => onDecline(drawing)}
                    className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-surface border text-[14px] font-medium transition-colors"
                    style={{ color: "#B6334C", borderColor: "#E8C5CD" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#FBEEF1";
                      e.currentTarget.style.borderColor = "#B6334C";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "";
                      e.currentTarget.style.borderColor = "#E8C5CD";
                    }}
                  >
                    <X className="w-4 h-4" strokeWidth={2.25} />
                    Afwijzen
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};
