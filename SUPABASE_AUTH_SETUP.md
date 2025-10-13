# Supabase Authentication Setup Guide

## Issue

After clicking the email confirmation link, users are redirected to `http://localhost:4000/?code=...` instead of going through the proper auth callback that redirects to onboarding.

## Solution

### For Hosted Supabase (Production)

You need to configure the Site URL and Redirect URLs in your Supabase Dashboard:

1. **Go to your Supabase Dashboard** at https://app.supabase.com
2. **Select your project** (`jsfyfqlmzqkaxjfkmpxw`)
3. **Navigate to**: Authentication → URL Configuration
4. **Set the following values**:
   - **Site URL**: `http://localhost:4000`
     - For production: `https://yourdomain.com`
   - **Redirect URLs** (add these to the allowed list):
     - `http://localhost:4000/auth/callback`
     - `http://127.0.0.1:4000/auth/callback`
     - For production: `https://yourdomain.com/auth/callback`

5. **Save changes**

### Email Confirmations

Ensure that email confirmations are enabled:

1. Go to: **Authentication → Providers → Email**
2. Check that **"Confirm email"** is enabled
3. This ensures users must verify their email before signing in

### How It Works Now

After you've configured the URLs:

1. **New User Signup Flow**:
   - User signs up at `/auth` (signup page)
   - User receives confirmation email with link to `http://localhost:4000/auth/callback?code=...`
   - Callback route checks if onboarding is complete
   - If not complete → redirects to `/onboarding`
   - After onboarding → redirects to `/dashboard`

2. **Existing Users**:
   - User logs in at `/auth/login`
   - If onboarding complete → `/dashboard`
   - If onboarding incomplete → `/onboarding`

### Testing

To test with a new account:

1. Clear your browser cookies/local storage
2. Sign up with a new email
3. Check your email for the confirmation link
4. Click the confirmation link
5. You should be redirected to the onboarding page

### Fallback Handling

The code now includes a fallback on the home page (`/`) that will redirect to the auth callback if it receives a `code` parameter. This handles cases where old confirmation emails still have the wrong redirect URL.

## Local Development

For local Supabase (if using `supabase start`):

The `supabase/config.toml` file has been updated with:

- `site_url = "http://localhost:4000"`
- `additional_redirect_urls` includes the callback URLs
- `enable_confirmations = true` for email verification

Restart your local Supabase after changing the config:

```bash
supabase stop
supabase start
```

## Production Deployment

When deploying to production:

1. Update the Site URL to your production domain (e.g., `https://yourdomain.com`)
2. Add production callback URL: `https://yourdomain.com/auth/callback`
3. Update environment variables if needed
4. Test the flow in production

## Troubleshooting

**Issue**: Still getting redirected to `/?code=...`

- **Solution**: The confirmation email was sent before the configuration change. The fallback handler on the home page will catch this and redirect properly. For new signups, it will work correctly.

**Issue**: Getting "redirect URL not allowed" error

- **Solution**: Make sure you've added the callback URL to the Redirect URLs list in Supabase Dashboard

**Issue**: Email not being sent

- **Solution**: Check your email rate limits in Supabase Dashboard (Authentication → Rate Limits)
