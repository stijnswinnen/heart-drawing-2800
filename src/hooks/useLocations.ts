import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Location {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  user_id: string | null;
  heart_user_id: string | null;
  status: 'new' | 'approved' | 'pending_verification' | 'rejected';
  rejection_reason: string | null;
}

export const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);

  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('id, name, description, latitude, longitude, user_id, heart_user_id, status, rejection_reason')
        .or('status.eq.approved,status.eq.rejected')
        .eq('share_consent', true);

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error("Er ging iets mis bij het ophalen van de locaties");
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return locations;
};