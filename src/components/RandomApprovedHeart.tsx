import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

export function RandomApprovedHeart() {
  const [hearts, setHearts] = useState<Tables<"drawings">[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApprovedHearts = async () => {
      try {
        console.log('Fetching approved hearts...');
        const { data, error } = await supabase
          .from('drawings')
          .select('*')
          .eq('status', 'approved');
        
        if (error) {
          console.error('Error fetching approved hearts:', error);
          toast.error("Failed to load approved hearts");
          return;
        }

        console.log('Fetched hearts:', data?.length || 0);
        setHearts(data || []);
      } catch (err) {
        console.error('Unexpected error:', err);
        toast.error("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApprovedHearts();
  }, []);

  useEffect(() => {
    if (hearts.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === hearts.length - 1 ? 0 : prevIndex + 1
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [hearts.length]);

  const getImageUrl = (drawing: Tables<"drawings">) => {
    try {
      // Construct path with optimized folder structure
      const imagePath = `optimized/${drawing.image_path}`;
      console.log('Getting image URL for:', imagePath);
      
      const { data } = supabase.storage
        .from('optimized')
        .getPublicUrl(imagePath);
      
      console.log('Generated URL:', data.publicUrl);
      return data.publicUrl;
    } catch (err) {
      console.error('Error generating image URL:', err);
      return '';
    }
  };

  if (isLoading) {
    return <div className="text-center text-gray-500">Loading hearts...</div>;
  }

  if (hearts.length === 0) {
    return <div className="text-center text-gray-500">No approved hearts found</div>;
  }

  const currentHeart = hearts[currentIndex];

  return (
    <div className="min-h-screen flex items-center justify-center gap-8">
      <h1 className="text-[150px] font-bold font-['Montserrat_Alternates']">
        2800
      </h1>
      <div className="w-[300px] h-[300px] animate-fade-in">
        <img
          key={currentHeart.id}
          src={getImageUrl(currentHeart)}
          alt={`Heart ${currentIndex + 1}`}
          className="w-full h-full object-contain rounded-lg"
          onError={(e) => {
            console.error('Image failed to load:', currentHeart.image_path);
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
      </div>
    </div>
  );
}