import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export function RandomApprovedHeart() {
  const [hearts, setHearts] = useState<Tables<"drawings">[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchApprovedHearts = async () => {
      const { data, error } = await supabase
        .from('drawings')
        .select('*')
        .eq('status', 'approved');
      
      if (error) {
        console.error('Error fetching approved hearts:', error);
        return;
      }

      setHearts(data || []);
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

  const getImageUrl = (imagePath: string) => {
    // Extract the filename from the full path
    const filename = imagePath.split('/').pop();
    if (!filename) return '';
    
    // Get the public URL directly from the optimized bucket
    const { data } = supabase.storage
      .from('optimized')
      .getPublicUrl(filename);
    
    return data.publicUrl;
  };

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
          src={getImageUrl(currentHeart.image_path)}
          alt={`Heart ${currentIndex + 1}`}
          className="w-full h-full object-contain rounded-lg"
        />
      </div>
    </div>
  );
}