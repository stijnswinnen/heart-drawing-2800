import { DatabaseEnums } from './enums';

export interface DrawingsTable {
  Row: {
    created_at: string;
    heart_user_id: string | null;
    id: string;
    image_path: string;
    status: DatabaseEnums["drawing_status"];
    submitted_at: string;
    updated_at: string;
    user_id: string | null;
  }
  Insert: {
    created_at?: string;
    heart_user_id?: string | null;
    id?: string;
    image_path: string;
    status?: DatabaseEnums["drawing_status"];
    submitted_at?: string;
    updated_at?: string;
    user_id?: string | null;
  }
  Update: {
    created_at?: string;
    heart_user_id?: string | null;
    id?: string;
    image_path?: string;
    status?: DatabaseEnums["drawing_status"];
    submitted_at?: string;
    updated_at?: string;
    user_id?: string | null;
  }
}

export interface ProfilesTable {
  Row: {
    id: string;
    email: string | null;
    name: string | null;
    role: DatabaseEnums["user_role"] | null;
    marketing_consent: boolean | null;
    email_verified: boolean | null;
    verification_token: string | null;
    verification_token_expires_at: string | null;
    last_verification_email_sent_at: string | null;
    reminder_sent_at: string | null;
    created_at: string;
    updated_at: string;
  }
  Insert: {
    id: string;
    email?: string | null;
    name?: string | null;
    role?: DatabaseEnums["user_role"] | null;
    marketing_consent?: boolean | null;
    email_verified?: boolean | null;
    verification_token?: string | null;
    verification_token_expires_at?: string | null;
    last_verification_email_sent_at?: string | null;
    reminder_sent_at?: string | null;
    created_at?: string;
    updated_at?: string;
  }
  Update: {
    id?: string;
    email?: string | null;
    name?: string | null;
    role?: DatabaseEnums["user_role"] | null;
    marketing_consent?: boolean | null;
    email_verified?: boolean | null;
    verification_token?: string | null;
    verification_token_expires_at?: string | null;
    last_verification_email_sent_at?: string | null;
    reminder_sent_at?: string | null;
    created_at?: string;
    updated_at?: string;
  }
}

export interface LocationLikesTable {
  Row: {
    created_at: string;
    heart_user_id: string | null;
    id: string;
    location_id: string;
    status: DatabaseEnums["like_status"] | null;
    updated_at: string;
    user_id: string | null;
  }
  Insert: {
    created_at?: string;
    heart_user_id?: string | null;
    id?: string;
    location_id: string;
    status?: DatabaseEnums["like_status"] | null;
    updated_at?: string;
    user_id?: string | null;
  }
  Update: {
    created_at?: string;
    heart_user_id?: string | null;
    id?: string;
    location_id?: string;
    status?: DatabaseEnums["like_status"] | null;
    updated_at?: string;
    user_id?: string | null;
  }
}

export interface LocationsTable {
  Row: {
    created_at: string;
    description: string | null;
    heart_user_id: string | null;
    id: string;
    latitude: number;
    longitude: number;
    name: string;
    recommendation: string | null;
    share_consent: boolean | null;
    status: DatabaseEnums["location_status"];
    updated_at: string;
    user_id: string | null;
  }
  Insert: {
    created_at?: string;
    description?: string | null;
    heart_user_id?: string | null;
    id?: string;
    latitude: number;
    longitude: number;
    name: string;
    recommendation?: string | null;
    share_consent?: boolean | null;
    status?: DatabaseEnums["location_status"];
    updated_at?: string;
    user_id?: string | null;
  }
  Update: {
    created_at?: string;
    description?: string | null;
    heart_user_id?: string | null;
    id?: string;
    latitude?: number;
    longitude?: number;
    name?: string;
    recommendation?: string | null;
    share_consent?: boolean | null;
    status?: DatabaseEnums["location_status"];
    updated_at?: string;
    user_id?: string | null;
  }
}

export interface VideoGenerationTable {
  Row: {
    created_at: string | null;
    id: string;
    last_processed_drawing_id: string | null;
    processed_count: number | null;
    updated_at: string | null;
  }
  Insert: {
    created_at?: string | null;
    id: string;
    last_processed_drawing_id?: string | null;
    processed_count?: number | null;
    updated_at?: string | null;
  }
  Update: {
    created_at?: string | null;
    id?: string;
    last_processed_drawing_id?: string | null;
    processed_count?: number | null;
    updated_at?: string | null;
  }
}
