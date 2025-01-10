import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from '@supabase/auth-helpers-react';

interface Drawing {
  image_path: string;
  user_id: string | null;
  heart_user_id: string | null;
  status: 'new' | 'approved' | 'pending_verification';
}

export const useApprovedHearts = () => {
  const [approvedHearts, setApprovedHearts] = useState<Drawing[]>([]);
  const session = useSession();

  const fetchApprovedHearts = async () => {
    try {
      // First, get the heart_user_id for the current authenticated user's email
      let heartUserId = null;
      if (session?.user?.email) {
        const { data: heartUser } = await supabase
          .from('heart_users')
          .select('id')
          .eq('email', session.user.email)
          .maybeSingle();
        
        heartUserId = heartUser?.id;
      }

      // Then fetch drawings that match either user_id or heart_user_id
      const { data, error } = await supabase
        .from('drawings')
        .select('image_path, user_id, heart_user_id, status')
        .or(`user_id.eq.${session?.user?.id},heart_user_id.eq.${heartUserId}`);
      
      if (error) throw error;
      setApprovedHearts(data || []);
    } catch (error) {
      console.error('Error fetching approved hearts:', error);
      toast.error("Er ging iets mis bij het ophalen van de hartjes");
    }
  };

  useEffect(() => {
    fetchApprovedHearts();
  }, [session?.user?.id, session?.user?.email]);

  return approvedHearts;
};