import { DatabaseEnums } from '../enums';

export interface LocationsTable {
  Row: {
    created_at: string
    description: string | null
    heart_user_id: string | null
    id: string
    latitude: number
    longitude: number
    name: string
    recommendation: string | null
    share_consent: boolean | null
    status: DatabaseEnums["location_status"]
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
    recommendation?: string | null
    share_consent?: boolean | null
    status?: DatabaseEnums["location_status"]
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
    recommendation?: string | null
    share_consent?: boolean | null
    status?: DatabaseEnums["location_status"]
    updated_at?: string
    user_id?: string | null
  }
}

export interface LocationLikesTable {
  Row: {
    created_at: string
    heart_user_id: string | null
    id: string
    location_id: string
    status: DatabaseEnums["like_status"] | null
    updated_at: string
    user_id: string | null
  }
  Insert: {
    created_at?: string
    heart_user_id?: string | null
    id?: string
    location_id: string
    status?: DatabaseEnums["like_status"] | null
    updated_at?: string
    user_id?: string | null
  }
  Update: {
    created_at?: string
    heart_user_id?: string | null
    id?: string
    location_id?: string
    status?: DatabaseEnums["like_status"] | null
    updated_at?: string
    user_id?: string | null
  }
}