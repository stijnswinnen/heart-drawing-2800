import { Heart } from "lucide-react";

interface DrawingTitleProps {
  isDrawing: boolean;
  onHeartClick: () => void;
}

export const DrawingTitle = ({ isDrawing, onHeartClick }: DrawingTitleProps) => {
  return (
    <div 
      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col md:flex-row items-center gap-4 transition-all duration-700 ${
        isDrawing ? 'md:translate-x-[-100%] md:ml-8 translate-y-[-30vh] md:translate-y-0' : ''
      }`}
    >
      <h1 
        className={`text-[clamp(100px,20vw,200px)] font-['Montserrat_Alternates'] transition-all duration-700 ${
          isDrawing ? 'opacity-20' : 'opacity-100'
        }`}
      >
        2800
      </h1>
      
      {!isDrawing && (
        <div 
          onClick={onHeartClick} 
          className="cursor-pointer transform hover:scale-105 transition-transform mt-4 md:mt-0"
        >
          <Heart 
            size={200} 
            className="text-primary animate-pulse z-10" 
            fill="#FFDEE2"
          />
        </div>
      )}
    </div>
  );
};