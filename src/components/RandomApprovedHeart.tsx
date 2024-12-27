import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function RandomApprovedHeart() {
  const [heartImage, setHeartImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchRandomHeart = async () => {
      const { data, error } = await supabase
        .from('drawings')
        .select('image_path')
        .eq('status', 'approved')
        .order('random()')
        .limit(1)
        .single();
      
      if (error) {
        console.error('Error fetching random heart:', error);
        return;
      }

      if (data) {
        const { data: imageUrl } = supabase.storage
          .from('optimized')
          .getPublicUrl(data.image_path);
        
        setHeartImage(imageUrl.publicUrl);
      }
    };

    fetchRandomHeart();
  }, []);

  if (!heartImage) return null;

  return (
    <div className="w-[200px] h-[200px]">
      <img
        src={heartImage}
        alt="Random approved heart"
        className="w-full h-full object-contain"
      />
    </div>
  );
}