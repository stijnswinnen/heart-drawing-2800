export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
        Relationships: [
          {
            foreignKeyName: "drawings_heart_user_id_fkey"
            columns: ["heart_user_id"]
            isOneToOne: false
            referencedRelation: "heart_users"
            referencedColumns: ["id"]
          },
        ]
      }
      heart_users: {
        Row: {
          created_at: string
          email: string
          email_verified: boolean | null
          id: string
          last_verification_email_sent_at: string | null
          marketing_consent: boolean | null
          name: string
          reminder_sent_at: string | null
          updated_at: string
          user_id: string | null
          verification_token: string | null
          verification_token_expires_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          email_verified?: boolean | null
          id?: string
          last_verification_email_sent_at?: string | null
          marketing_consent?: boolean | null
          name: string
          reminder_sent_at?: string | null
          updated_at?: string
          user_id?: string | null
          verification_token?: string | null
          verification_token_expires_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          email_verified?: boolean | null
          id?: string
          last_verification_email_sent_at?: string | null
          marketing_consent?: boolean | null
          name?: string
          reminder_sent_at?: string | null
          updated_at?: string
          user_id?: string | null
          verification_token?: string | null
          verification_token_expires_at?: string | null
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
            foreignKeyName: "location_likes_heart_user_id_fkey"
            columns: ["heart_user_id"]
            isOneToOne: false
            referencedRelation: "heart_users"
            referencedColumns: ["id"]
          },
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
          created_at: string
          description: string | null
          heart_user_id: string | null
          id: string
          latitude: number
          longitude: number
          name: string
          share_consent: boolean | null
          status: Database["public"]["Enums"]["location_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          heart_user_id?: string | null
          id?: string
          latitude: number
          longitude: number
          name: string
          share_consent?: boolean | null
          status?: Database["public"]["Enums"]["location_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          heart_user_id?: string | null
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          share_consent?: boolean | null
          status?: Database["public"]["Enums"]["location_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_heart_user_id_fkey"
            columns: ["heart_user_id"]
            isOneToOne: false
            referencedRelation: "heart_users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          marketing_consent: boolean | null
          name: string
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          marketing_consent?: boolean | null
          name: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          marketing_consent?: boolean | null
          name?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      set_admin_role: {
        Args: {
          user_email: string
        }
        Returns: undefined
      }
    }
    Enums: {
      drawing_status: "new" | "approved" | "pending_verification"
      like_status: "active" | "removed"
      location_status: "new" | "approved" | "pending_verification"
      user_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
