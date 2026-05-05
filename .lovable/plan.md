## Goal
Fix the unverified `noreply@hearts.be` sender (and other unverified domains) so emails actually deliver via Resend using the verified `2800.love` domain.

## Findings
Searched all edge functions for `from:` addresses. Found these senders:

| File | Current `from` | Status |
|---|---|---|
| `send-heart-notification/index.ts:156` | `Hearts <noreply@hearts.be>` | ❌ unverified — the one you flagged |
| `send-password-reset/index.ts:38` | `Mechelen Hartverwarmend <noreply@mechelen-hartverwarmend.be>` | ❌ likely unverified |
| `send-location-notification/index.ts:119` | `2800.Love <heart@stijnswinnen.be>` | ❌ different domain |
| `send-verification-email/index.ts:73` | `verify@2800.love` | ✅ verified |
| `send-verification-reminder/index.ts:61` | `verify@2800.love` | ✅ verified |
| `send-test-email/index.ts:61` | `delivered@resend.dev` | ✅ Resend test address |

## Changes
Update all three unverified senders to use `2800.love`:

1. **`send-heart-notification/index.ts`** → `2800.love <noreply@2800.love>`
2. **`send-password-reset/index.ts`** → `2800.love <noreply@2800.love>`
3. **`send-location-notification/index.ts`** → `2800.love <noreply@2800.love>`

Leave `send-verification-email`, `send-verification-reminder` (already on `2800.love` with `verify@`), and `send-test-email` (Resend sandbox) untouched.

No other code/logic changes. After approval I'll redeploy the three edge functions.

## Question
Want me to also unify the verification emails to `noreply@2800.love`, or keep `verify@2800.love` for those (it's a nice semantic split)? Default: keep them as-is.