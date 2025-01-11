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

  const getImageUrl = (filename: string) => {
    try {
      // Clean the filename by removing any path segments
      const cleanFilename = filename.split('/').pop() || '';
      console.log('Getting image URL for filename:', cleanFilename);
      
      const { data } = supabase.storage
        .from('optimized')
        .getPublicUrl(cleanFilename);
      
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
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 px-4 md:px-8">
      <h1 className="text-[100px] md:text-[150px] font-bold font-['Montserrat_Alternates'] text-center">
        2800
      </h1>
      <div className="w-[250px] h-[250px] md:w-[300px] md:h-[300px] animate-fade-in">
        <img
          key={currentHeart.id}
          src={getImageUrl(currentHeart.image_path)}
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