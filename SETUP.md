# Easy Habit Pro - Supabase Setup Guide

This guide walks you through setting up Supabase for the Easy Habit Pro application.

## Prerequisites

- A Supabase account (free tier works fine)
- Node.js 18+ installed
- The project cloned and dependencies installed (`npm install`)

---

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Enter project details:
   - **Name**: `easy-habit-pro`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose the region closest to your users
4. Click **"Create new project"**
5. Wait 2-3 minutes for the project to provision

---

## Step 2: Get Your API Keys

1. Once your project is ready, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
3. Create a `.env` file in your project root:

```bash
# Copy from .env.example and fill in your values
cp .env.example .env
```

4. Update `.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_URL=http://localhost:5173
```

---

## Step 3: Run Database Migrations

1. Go to the **SQL Editor** in your Supabase Dashboard
2. Click **"New query"**
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste it into the SQL Editor
5. Click **"Run"** (or press Cmd/Ctrl + Enter)

You should see "Success. No rows returned" - this is expected!

### Verify Tables Were Created

1. Go to **Table Editor** in the sidebar
2. You should see these tables:
   - `profiles`
   - `habits`
   - `habit_entries`
   - `tags`
   - `habit_tags`
   - `achievements`
   - `sync_log`

---

## Step 4: Configure Authentication

### Enable Email/Password Auth (Default)

Email authentication is enabled by default. No action needed.

### Enable Google OAuth (Optional)

1. Go to **Authentication** → **Providers**
2. Find **Google** and click to expand
3. Toggle **Enable Sign in with Google**
4. You'll need Google OAuth credentials:

   **Create Google OAuth Credentials:**

   1. Go to [Google Cloud Console](https://console.cloud.google.com/)
   2. Create a new project (or select existing)
   3. Go to **APIs & Services** → **Credentials**
   4. Click **"Create Credentials"** → **"OAuth client ID"**
   5. Select **"Web application"**
   6. Add authorized redirect URI:
      ```
      https://your-project-id.supabase.co/auth/v1/callback
      ```
   7. Copy the **Client ID** and **Client Secret**

5. Paste the credentials into Supabase Google provider settings
6. Click **Save**

### Configure Auth URLs

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:5173` (for development)
3. Add **Redirect URLs**:
   - `http://localhost:5173`
   - `http://localhost:5173/app`
   - Your production URL when you deploy

---

## Step 5: Customize Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize templates for:
   - **Confirm signup** - Email sent when user signs up
   - **Reset password** - Email sent for password reset
   - **Magic link** - Email sent for passwordless login

Example customization for Confirm Signup:

```html
<h2>Welcome to Easy Habit Pro!</h2>
<p>
  Thanks for signing up. Please confirm your email by clicking the button below:
</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
```

---

## Step 6: Test Your Setup

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Open [http://localhost:5173](http://localhost:5173)

3. Try signing up with a new account

4. Check the Supabase Dashboard:
   - **Authentication** → **Users** - You should see your new user
   - **Table Editor** → **profiles** - A profile should be auto-created

---

## Troubleshooting

### "Supabase credentials not found" warning

- Make sure you created a `.env` file (not `.env.example`)
- Make sure the variable names start with `VITE_`
- Restart the dev server after changing `.env`

### Authentication not working

- Check that your Site URL matches exactly (including http vs https)
- Verify the Redirect URLs include your app URL
- Check browser console for specific error messages

### Tables not created

- Re-run the SQL migration
- Check for any error messages in the SQL Editor output
- Make sure you ran the entire file, not just part of it

### Profile not auto-created on signup

- Verify the `handle_new_user` function was created
- Check the trigger `on_auth_user_created` exists
- Look in **Database** → **Functions** for `handle_new_user`

---

## Next Steps

After completing this setup:

1. ✅ Supabase project created
2. ✅ Database schema migrated
3. ✅ RLS policies configured
4. ✅ Auth providers enabled
5. ✅ Environment variables set

Proceed to **Day 16: Authentication Integration** to connect the frontend to Supabase auth.

---

## Production Deployment

When deploying to production:

1. Update `.env` with production Supabase URL (same project or create new)
2. Update **Site URL** in Supabase to your production domain
3. Add production domain to **Redirect URLs**
4. Enable Google OAuth for production domain
5. Set environment variables in your hosting platform (Netlify, Vercel, etc.)

---

## Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
