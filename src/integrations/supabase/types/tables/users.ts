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