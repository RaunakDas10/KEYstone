# AUTH IMPLEMENTATION PLAN

## Goal
Replace the current demo login flow with a real authentication system that supports:
- email/password sign up and login
- email verification with OTP via SMTP
- Google sign-in using Google Client ID
- role-based access after verification

## Phase 1: Data model and config
- Extend the user model with auth fields:
  - passwordHash
  - emailVerified
  - otpCode
  - otpExpiresAt
  - authProvider
  - googleId
- Add env vars for JWT / app URL / Google client ID
- Ensure only verified users can sign in

## Phase 2: Backend auth APIs
Add server endpoints:
- POST /api/auth/register
- POST /api/auth/send-otp
- POST /api/auth/verify-otp
- POST /api/auth/login
- POST /api/auth/google
- GET /api/auth/me

These routes must validate:
- real email format
- password strength
- unique email addresses
- verified email state before login

## Phase 3: SMTP OTP delivery
- Use nodemailer with Gmail SMTP settings
- Generate 6-digit OTP
- Store hash/code with expiry
- Send OTP email via SMTP
- Reject expired or invalid OTPs

## Phase 4: Google sign-in
- Verify Google ID token/server payload
- Match email to existing user or create a verified user
- Log the user in with the same app session

## Phase 5: Frontend auth UX
Update login/register pages to:
- use real email/password fields
- support OTP verification step after register
- include Google sign-in button
- call API endpoints instead of seeded demo login
- store auth token/session in client state

## Phase 6: Validation
- run TypeScript build
- verify API routes compile
- smoke-test login/register flows locally
- confirm Google config matches local origin/redirect values

## Implementation order
1. User model + server auth service
2. OTP email flow
3. Register/login routes
4. Google auth route
5. frontend page wiring
6. build verification
