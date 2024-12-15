import { createContext, useContext, useState } from "react";

interface DrawingContextType {
  penSize: number;
  setPenSize: (size: number) => void;
  penColor: string;
  setPenColor: (color: string) => void;
  isEraser: boolean;
  setIsEraser: (isEraser: boolean) => void;
  hasDrawn: boolean;
  setHasDrawn: (hasDrawn: boolean) => void;
  canUndo: boolean;
  setCanUndo: (canUndo: boolean) => void;
}

const DrawingContext = createContext<DrawingContextType | undefined>(undefined);

export const useDrawing = () => {
  const context = useContext(DrawingContext);
  if (!context) {
    throw new Error("useDrawing must be used within a DrawingProvider");
  }
  return context;
};

export const DrawingProvider = ({ children }: { children: React.ReactNode }) => {
  const [penSize, setPenSize] = useState(5);
  const [penColor, setPenColor] = useState("#000000");
  const [isEraser, setIsEraser] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [canUndo, setCanUndo] = useState(false);

  return (
    <DrawingContext.Provider
      value={{
        penSize,
        setPenSize,
        penColor,
        setPenColor,
        isEraser,
        setIsEraser,
        hasDrawn,
        setHasDrawn,
        canUndo,
        setCanUndo,
      }}
    >
      {children}
    </DrawingContext.Provider>
  );
};