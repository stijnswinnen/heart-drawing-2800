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
        .select('location_id')
        .eq('status', 'active')
        .then(result => {
          if (result.error) throw result.error;
          
          // Group and count likes by location_id
          const groupedLikes = result.data.reduce((acc: Record<string, number>, curr) => {
            acc[curr.location_id] = (acc[curr.location_id] || 0) + 1;
            return acc;
          }, {});
          
          return { data: groupedLikes, error: null };
        });

      if (error) throw error;
      setLocationLikes(data);
    } catch (error) {
      console.error('Error fetching location likes:', error);
      toast.error("Er ging iets mis bij het ophalen van de likes");
    }
  };

  const handleLike = async (locationId: string) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      
      if (!user) {
        toast.error("Je moet ingelogd zijn om te kunnen liken");
        return;
      }

      const { data: existingLike, error: fetchError } = await supabase
        .from('location_likes')
        .select('id, status')
        .eq('location_id', locationId)
        .eq('user_id', user.id)
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
            user_id: user.id 
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