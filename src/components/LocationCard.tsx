import { Link } from "react-router-dom";

export interface LocationCardData {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  // Optional metadata fields. May not exist on backend yet.
  neighbourhood?: string | null;
  shared_by_name?: string | null;
}

interface LocationCardProps {
  location: LocationCardData;
  slug: string;
}

const tagStyleFor = (category: string | null) => {
  const cat = (category || "").toLowerCase();
  switch (cat) {
    case "natuur":
      return { background: "var(--green-50)", color: "var(--green-700)" };
    case "horeca":
      return { background: "var(--pink-50)", color: "var(--pink-600)" };
    case "cultuur":
      return { background: "var(--lav-50)", color: "var(--lav-700)" };
    case "stad":
      return { background: "var(--sand-50)", color: "var(--sand-700)" };
    default:
      return {
        background: "var(--bg)",
        color: "var(--ink-muted)",
        border: "1px solid var(--line)",
      } as React.CSSProperties;
  }
};

export const LocationCard = ({ location, slug }: LocationCardProps) => {
  const tagStyle = tagStyleFor(location.category);
  const desc = location.description?.split(/(?<=[.!?])\s+/)[0] || "";

  const metaParts = [location.neighbourhood, location.shared_by_name && `gedeeld door ${location.shared_by_name}`]
    .filter(Boolean) as string[];

  return (
    <Link
      to={`/locaties/${slug}`}
      className="block bg-surface border border-line rounded-[14px] p-[22px] transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-ink-2"
    >
      {location.category && (
        <span
          className="inline-block uppercase text-[12px] font-medium tracking-wide rounded-full mb-3"
          style={{ ...tagStyle, padding: "5px 11px" }}
        >
          {location.category}
        </span>
      )}
      <h3
        className="font-fraunces font-normal text-ink mb-2"
        style={{ fontSize: "22px", lineHeight: 1.15 }}
      >
        {location.name}
      </h3>
      {desc && (
        <p style={{ fontSize: "15px", lineHeight: 1.55, color: "var(--ink-2)" }}>
          {desc}
        </p>
      )}
      {metaParts.length > 0 && (
        <p
          className="mt-3"
          style={{ fontSize: "12.5px", color: "var(--muted)" }}
        >
          {metaParts.join(" · ")}
        </p>
      )}
    </Link>
  );
};
