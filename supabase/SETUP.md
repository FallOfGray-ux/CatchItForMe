# Supabase Setup — Catch It For Me

This turns the game from local-only into a proper cloud-saved, account-based app. Coins, skins, and backgrounds persist across devices.

## 1. Create a Supabase project

1. Go to <https://supabase.com> and sign up / log in (free tier is fine).
2. Click **New Project**. Pick an org, name it `catch-it-for-me`, set a strong database password, pick a region close to you, and hit **Create new project**.
3. Wait ~1 minute for it to provision.

## 2. Run the schema

1. In the project sidebar, open **SQL Editor → New query**.
2. Open `schema.sql` from this folder, paste the whole thing into the editor, click **Run**.
3. You should see `Success. No rows returned`. That's expected — it created a table, a trigger, and policies.

## 3. Enable email/password auth

1. Sidebar → **Authentication → Providers**.
2. Make sure **Email** is enabled (it is by default).
3. Scroll down to **Confirm email**. For local testing, I recommend toggling this **OFF** so signups work instantly without needing to click an email link. Turn it back on before going to production.
4. Save.

## 4. Grab your project credentials

1. Sidebar → **Project Settings → API**.
2. Copy these two values — you'll paste them into the app in step 5:
   - **Project URL** (looks like `https://abcd1234.supabase.co`)
   - **anon public** key (a long JWT starting with `eyJ...`)

> The `anon` key is safe to put in client-side code. Row Level Security (set up by `schema.sql`) is what keeps each user's data private.

## 5. Plug keys into the cloud app

Open `catch-it-for-me-cloud.html` in a text editor and find these two lines near the top of the `<script>` block:

```js
const SUPABASE_URL = "PASTE_YOUR_PROJECT_URL_HERE";
const SUPABASE_ANON_KEY = "PASTE_YOUR_ANON_KEY_HERE";
```

Replace the placeholders with the values from step 4. Save. Open the file in a browser — you should see a sign-up screen.

## 6. Test it

1. Open the app. Click **Sign up**, enter any email + password (≥ 6 chars).
2. You'll be logged in and see the home screen.
3. Play a round, earn coins. Close the tab.
4. Reopen the app. Log in. Coins are still there, loaded from Supabase.

## 7. (Optional) Turn on email confirmation for production

When you're ready to ship:
- Sidebar → **Authentication → Providers → Email → Confirm email: ON**.
- Sidebar → **Authentication → URL Configuration** — set your production site URL so confirmation links work.

## Troubleshooting

**"Failed to fetch" / nothing happens on sign up**
Your `SUPABASE_URL` or `SUPABASE_ANON_KEY` is wrong, or your browser is offline. Double-check the values in step 5.

**Sign up succeeds but profile doesn't load**
The `handle_new_user` trigger didn't fire. Re-run `schema.sql` in full.

**"row violates row-level security policy"**
You're trying to read/write a profile that isn't your own, or you're unauthenticated. Log in first.

**I want to wipe a test account**
Sidebar → **Authentication → Users** → select user → Delete. The profile row is cascaded automatically.

## What each piece of the schema does

- `profiles` — one row per authenticated user, holds coins + unlocks + stats
- `handle_new_user` trigger — when someone signs up, auto-creates their profile row
- `touch_updated_at` trigger — keeps `updated_at` fresh on every save
- RLS policies — a user can only read/write their own row
- `leaderboard` view — public read-only top 100 streaks (anonymous, shows only first 8 chars of id)
