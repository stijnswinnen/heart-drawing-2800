import { DrawingsTable, HeartUsersTable, LocationLikesTable, LocationsTable, ProfilesTable, VideoGenerationTable } from './tables';
import { DatabaseEnums } from './enums';

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
      drawings: DrawingsTable
      heart_users: HeartUsersTable
      location_likes: LocationLikesTable
      locations: LocationsTable
      profiles: ProfilesTable
      video_generation: VideoGenerationTable
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
    Enums: DatabaseEnums
    CompositeTypes: {
      [_ in never]: never
    }
  }
}