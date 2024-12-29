import React from 'react';
import { cn } from "@/lib/utils";

interface DrawingTitleProps {
  isDrawing: boolean;
  onHeartClick: () => void;
  className?: string;
}

export const DrawingTitle: React.FC<DrawingTitleProps> = ({ 
  isDrawing, 
  onHeartClick, 
  className 
}) => {
  return (
    <h1 
      className={cn(
        "text-4xl md:text-[70px] font-['Montserrat_Alternates'] font-semibold text-center mb-8", 
        className
      )}
    >
      {!isDrawing ? (
        <>
          Draw a <span 
            onClick={onHeartClick} 
            className="text-primary cursor-pen hover:text-primary/80 transition-colors"
          >
            Heart
          </span>
        </>
      ) : (
        "Draw Your Heart"
      )}
    </h1>
  );
};