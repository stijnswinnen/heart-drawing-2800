import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Drawing {
  image_path: string;
  user_id: string | null;
}

export const useApprovedHearts = () => {
  const [approvedHearts, setApprovedHearts] = useState<Drawing[]>([]);

  const fetchApprovedHearts = async () => {
    try {
      const { data, error } = await supabase
        .from('drawings')
        .select('image_path, user_id')
        .eq('status', 'approved');
      
      if (error) throw error;
      setApprovedHearts(data || []);
    } catch (error) {
      console.error('Error fetching approved hearts:', error);
      toast.error("Er ging iets mis bij het ophalen van de hartjes");
    }
  };

  useEffect(() => {
    fetchApprovedHearts();
  }, []);

  return approvedHearts;
};