import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LocationLike {
  location_id: string;
  count: number;
}

export const useLocationLikes = () => {
  const [locationLikes, setLocationLikes] = useState<Record<string, number>>({});

  const fetchLocationLikes = async () => {
    try {
      const { data, error } = await supabase
        .from('location_likes')
        .select('location_id, count')
        .eq('status', 'active')
        .select('location_id, count(*)', { count: 'exact' })
        .groupBy('location_id');

      if (error) throw error;

      const likesMap: Record<string, number> = {};
      (data as LocationLike[]).forEach(like => {
        likesMap[like.location_id] = Number(like.count);
      });
      setLocationLikes(likesMap);
    } catch (error) {
      console.error('Error fetching location likes:', error);
      toast.error("Er ging iets mis bij het ophalen van de likes");
    }
  };

  const handleLike = async (locationId: string) => {
    try {
      const { data: existingLike, error: fetchError } = await supabase
        .from('location_likes')
        .select('id, status')
        .eq('location_id', locationId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingLike) {
        if (existingLike.status === 'removed') {
          const { error } = await supabase
            .from('location_likes')
            .update({ status: 'active' })
            .eq('id', existingLike.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('location_likes')
            .update({ status: 'removed' })
            .eq('id', existingLike.id);

          if (error) throw error;
        }
      } else {
        const { error } = await supabase
          .from('location_likes')
          .insert([{ 
            location_id: locationId, 
            user_id: (await supabase.auth.getUser()).data.user?.id 
          }]);

        if (error) throw error;
      }

      await fetchLocationLikes();
      toast.success("Like bijgewerkt!");
    } catch (error) {
      console.error('Error handling like:', error);
      toast.error("Er ging iets mis bij het liken");
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('location-likes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'location_likes'
        },
        () => {
          fetchLocationLikes();
        }
      )
      .subscribe();

    // Initial fetch
    fetchLocationLikes();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { locationLikes, handleLike };
};