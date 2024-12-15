# Send Verification Email Function

This Edge Function handles sending verification emails to users who submit heart drawings.

## Features

- Sends verification emails using Resend
- Implements a 5-minute cooldown between verification email requests
- Generates and manages verification tokens
- Includes error handling and logging

## Environment Variables Required

- `RESEND_API_KEY`: API key for Resend email service
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

## Usage

The function expects a POST request with the following JSON body:

```json
{
  "heartUserId": "uuid",
  "name": "string",
  "email": "string"
}
```

## Response

Success:
```json
{
  "message": "Verification email sent successfully"
}
```

Error:
```json
{
  "error": "Error message"
}
```