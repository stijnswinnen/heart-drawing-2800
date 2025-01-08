import { DatabaseEnums } from './enums';

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

export interface HeartUsersTable {
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

export interface ProfilesTable {
  Row: {
    created_at: string
    id: string
    marketing_consent: boolean | null
    role: DatabaseEnums["user_role"] | null
    updated_at: string
  }
  Insert: {
    created_at?: string
    id: string
    marketing_consent?: boolean | null
    role?: DatabaseEnums["user_role"] | null
    updated_at?: string
  }
  Update: {
    created_at?: string
    id?: string
    marketing_consent?: boolean | null
    role?: DatabaseEnums["user_role"] | null
    updated_at?: string
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