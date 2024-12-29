import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function ApprovedHeartsCarousel() {
  const [approvedHearts, setApprovedHearts] = useState<Array<{ image_path: string }>>([]);

  useEffect(() => {
    const fetchApprovedHearts = async () => {
      const { data, error } = await supabase
        .from('drawings')
        .select('image_path')
        .eq('status', 'approved');
      
      if (error) {
        console.error('Error fetching approved hearts:', error);
        return;
      }

      setApprovedHearts(data || []);
    };

    fetchApprovedHearts();
  }, []);

  const getImageUrl = (filename: string) => {
    try {
      console.log('Getting image URL for filename:', filename);
      const { data } = supabase.storage
        .from('optimized')
        .getPublicUrl(`optimized/${filename}`);
      
      console.log('Generated URL:', data.publicUrl);
      return data.publicUrl;
    } catch (err) {
      console.error('Error generating image URL:', err);
      return '';
    }
  };

  if (approvedHearts.length === 0) {
    return null;
  }

  return (
    <Carousel className="w-full max-w-xs mx-auto">
      <CarouselContent>
        {approvedHearts.map((heart, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <img
                src={getImageUrl(heart.image_path)}
                alt={`Approved heart ${index + 1}`}
                className="w-full h-auto rounded-lg animate-pulse"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}