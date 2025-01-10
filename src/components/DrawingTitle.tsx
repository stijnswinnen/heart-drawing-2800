import { Heart } from "lucide-react";

interface DrawingTitleProps {
  isDrawing: boolean;
  onHeartClick: () => void;
}

export const DrawingTitle = ({ isDrawing, onHeartClick }: DrawingTitleProps) => {
  return (
    <div 
      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col md:flex-row items-center gap-4 transition-all duration-700 ${
        isDrawing ? 'md:translate-x-[-150%] md:ml-8 md:top-1/2 top-8 -translate-y-0 mt-4' : ''
      }`}
    >
      <h1 
        className={`text-[clamp(100px,20vw,200px)] font-['Montserrat_Alternates'] font-semibold transition-all duration-700 ${
          isDrawing ? 'opacity-20 md:opacity-20' : 'opacity-100'
        }`}
      >
        2800
      </h1>
      
      {!isDrawing && (
        <div 
          onClick={onHeartClick} 
          className="relative cursor-pointer transform hover:scale-105 transition-all duration-300 mt-4 md:mt-0"
        >
          <div className="absolute inset-0 blur-xl bg-gradient-to-r from-[#fc2c03] to-[#E02653] opacity-50" />
          <Heart 
            size={200} 
            className="text-primary animate-[pulse_1000ms_ease-in-out_infinite] relative z-10 drop-shadow-xl hover:drop-shadow-2xl transition-all duration-300" 
            fill="#FFDEE2"
            strokeWidth={0}
          />
        </div>
      )}
    </div>
  );
};