import { DatabaseEnums } from '../enums';

export interface ProfilesTable {
  Row: {
    id: string
    role: DatabaseEnums["user_role"] | null
    marketing_consent: boolean | null
    created_at: string
    updated_at: string
  }
  Insert: {
    id: string
    role?: DatabaseEnums["user_role"] | null
    marketing_consent?: boolean | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    role?: DatabaseEnums["user_role"] | null
    marketing_consent?: boolean | null
    created_at?: string
    updated_at?: string
  }
}