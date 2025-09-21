export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      drawings: {
        Row: {
          created_at: string
          heart_user_id: string | null
          id: string
          image_path: string
          status: Database["public"]["Enums"]["drawing_status"]
          submitted_at: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          heart_user_id?: string | null
          id?: string
          image_path: string
          status?: Database["public"]["Enums"]["drawing_status"]
          submitted_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          heart_user_id?: string | null
          id?: string
          image_path?: string
          status?: Database["public"]["Enums"]["drawing_status"]
          submitted_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      location_likes: {
        Row: {
          created_at: string
          heart_user_id: string | null
          id: string
          location_id: string
          status: Database["public"]["Enums"]["like_status"] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          heart_user_id?: string | null
          id?: string
          location_id: string
          status?: Database["public"]["Enums"]["like_status"] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          heart_user_id?: string | null
          id?: string
          location_id?: string
          status?: Database["public"]["Enums"]["like_status"] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "location_likes_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          heart_user_id: string | null
          id: string
          image_path: string | null
          latitude: number
          longitude: number
          name: string
          recommendation: string | null
          rejection_reason: string | null
          share_consent: boolean | null
          status: Database["public"]["Enums"]["location_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          heart_user_id?: string | null
          id?: string
          image_path?: string | null
          latitude: number
          longitude: number
          name: string
          recommendation?: string | null
          rejection_reason?: string | null
          share_consent?: boolean | null
          status?: Database["public"]["Enums"]["location_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          heart_user_id?: string | null
          id?: string
          image_path?: string | null
          latitude?: number
          longitude?: number
          name?: string
          recommendation?: string | null
          rejection_reason?: string | null
          share_consent?: boolean | null
          status?: Database["public"]["Enums"]["location_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["name"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          email_verified: boolean | null
          id: string
          last_verification_email_sent_at: string | null
          marketing_consent: boolean | null
          name: string | null
          reminder_sent_at: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
          verification_token: string | null
          verification_token_expires_at: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          email_verified?: boolean | null
          id: string
          last_verification_email_sent_at?: string | null
          marketing_consent?: boolean | null
          name?: string | null
          reminder_sent_at?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          verification_token?: string | null
          verification_token_expires_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          email_verified?: boolean | null
          id?: string
          last_verification_email_sent_at?: string | null
          marketing_consent?: boolean | null
          name?: string | null
          reminder_sent_at?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          verification_token?: string | null
          verification_token_expires_at?: string | null
        }
        Relationships: []
      }
      security_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_id?: string | null
        }
        Relationships: []
      }
      video_generation: {
        Row: {
          created_at: string | null
          id: string
          last_processed_drawing_id: string | null
          processed_count: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_processed_drawing_id?: string | null
          processed_count?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_processed_drawing_id?: string | null
          processed_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_generation_last_processed_drawing_id_fkey"
            columns: ["last_processed_drawing_id"]
            isOneToOne: false
            referencedRelation: "drawings"
            referencedColumns: ["id"]
          },
        ]
      }
      video_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          fps: number
          id: string
          job_type: string
          logs: Json | null
          max_frames: number
          progress: number | null
          rendi_job_id: string | null
          sorting: string | null
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
          video_path: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          fps: number
          id?: string
          job_type: string
          logs?: Json | null
          max_frames: number
          progress?: number | null
          rendi_job_id?: string | null
          sorting?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
          video_path?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          fps?: number
          id?: string
          job_type?: string
          logs?: Json | null
          max_frames?: number
          progress?: number | null
          rendi_job_id?: string | null
          sorting?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          video_path?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      secure_profiles: {
        Row: {
          created_at: string | null
          email: string | null
          email_verified: boolean | null
          id: string | null
          marketing_consent: boolean | null
          name: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          email_verified?: boolean | null
          id?: string | null
          marketing_consent?: boolean | null
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          email_verified?: boolean | null
          id?: string | null
          marketing_consent?: boolean | null
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      cleanup_expired_verification_tokens: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_unverified_profiles: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_profile_minimal_by_email: {
        Args: { p_email: string }
        Returns: {
          email_verified: boolean
          id: string
        }[]
      }
      get_public_profile: {
        Args: { p_id: string }
        Returns: {
          id: string
          name: string
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      set_admin_role: {
        Args: { user_email: string }
        Returns: undefined
      }
      verify_profile_secure: {
        Args: { p_email: string; p_token: string }
        Returns: boolean
      }
      verify_user_email: {
        Args: { p_email: string; p_token: string }
        Returns: Json
      }
    }
    Enums: {
      drawing_status: "new" | "approved" | "pending_verification"
      like_status: "active" | "removed"
      location_status: "new" | "approved" | "pending_verification" | "rejected"
      user_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      drawing_status: ["new", "approved", "pending_verification"],
      like_status: ["active", "removed"],
      location_status: ["new", "approved", "pending_verification", "rejected"],
      user_role: ["user", "admin"],
    },
  },
} as const
