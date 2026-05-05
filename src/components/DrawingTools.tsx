import { Eraser } from "lucide-react";

interface DrawingToolsProps {
  penSize: number;
  setPenSize: (size: number) => void;
  penColor: string;
  setPenColor: (color: string) => void;
  isEraser: boolean;
  setIsEraser: (isEraser: boolean) => void;
}

const PenIcon = ({ stroke }: { stroke: number }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19l7-7 3 3-7 7-3-3z" />
    <path d="M18 13l-6-6" />
    <path d="M2 22l3-1 1-3" />
  </svg>
);

export const DrawingTools = ({
  penSize,
  setPenSize,
  penColor,
  setPenColor,
  isEraser,
  setIsEraser,
}: DrawingToolsProps) => {
  const pens: { size: number; stroke: number }[] = [
    { size: 1, stroke: 1.5 },
    { size: 5, stroke: 2.25 },
    { size: 10, stroke: 3.25 },
  ];

  return (
    <div className="tools-pill canvas-mode-only-static">
      {pens.map((p) => {
        const active = !isEraser && penSize === p.size;
        return (
          <button
            key={p.size}
            type="button"
            className={`tool ${active ? "active" : ""}`}
            aria-label={`Penseel ${p.size}`}
            onClick={() => {
              setPenSize(p.size);
              setIsEraser(false);
            }}
          >
            <PenIcon stroke={p.stroke} />
          </button>
        );
      })}

      <span className="divider" />

      <button
        type="button"
        className={`tool ${isEraser ? "active" : ""}`}
        aria-label="Gum"
        onClick={() => setIsEraser(!isEraser)}
      >
        <Eraser className="w-4 h-4" />
      </button>

      <span className="divider" />

      <input
        type="color"
        value={penColor}
        aria-label="Kleur"
        onChange={(e) => {
          setPenColor(e.target.value);
          setIsEraser(false);
        }}
        className="swatch active"
      />
    </div>
  );
};
