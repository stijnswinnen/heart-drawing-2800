import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export function RandomApprovedHeart() {
  const [hearts, setHearts] = useState<Tables<"drawings">[]>([]);

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

  const getImageUrl = (drawing: Tables<"drawings">) => {
    const filename = drawing.image_path.split('/').pop();
    const imagePath = `optimized/${filename}`;
    const { data } = supabase.storage.from('optimized').getPublicUrl(imagePath);
    return data.publicUrl;
  };

  if (hearts.length === 0) {
    return <div className="text-center text-gray-500">No approved hearts found</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4 max-w-7xl mx-auto">
      {hearts.map((heart) => (
        <div key={heart.id} className="aspect-square">
          <img
            src={getImageUrl(heart)}
            alt="Approved heart"
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
      ))}
    </div>
  );
}