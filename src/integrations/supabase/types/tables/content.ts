import { DatabaseEnums } from '../enums';

export interface DrawingsTable {
  Row: {
    created_at: string
    heart_user_id: string | null
    id: string
    image_path: string
    status: DatabaseEnums["drawing_status"]
    submitted_at: string
    updated_at: string
    user_id: string | null
  }
  Insert: {
    created_at?: string
    heart_user_id?: string | null
    id?: string
    image_path: string
    status?: DatabaseEnums["drawing_status"]
    submitted_at?: string
    updated_at?: string
    user_id?: string | null
  }
  Update: {
    created_at?: string
    heart_user_id?: string | null
    id?: string
    image_path?: string
    status?: DatabaseEnums["drawing_status"]
    submitted_at?: string
    updated_at?: string
    user_id?: string | null
  }
}

export interface VideoGenerationTable {
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
}