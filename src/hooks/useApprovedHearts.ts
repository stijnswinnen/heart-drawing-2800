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
      // First, get the profile id for the current authenticated user's email
      let profileId = null;
      if (session?.user?.email) {
        const { data: profile } = await supabase
          .rpc('get_profile_minimal_by_email', { p_email: session.user.email });
        
        profileId = profile?.[0]?.id;
      }

      // Then fetch drawings that match either user_id or heart_user_id
      let query = supabase
        .from('drawings')
        .select('image_path, user_id, heart_user_id, status');

      if (session?.user?.id || profileId) {
        query = query.or(
          `user_id.eq.${session?.user?.id}${profileId ? `,heart_user_id.eq.${profileId}` : ''}`
        );
      }
      
      const { data, error } = await query;
      
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