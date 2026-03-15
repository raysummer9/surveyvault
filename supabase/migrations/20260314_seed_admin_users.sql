-- Seed admin_users so RLS policies allow admins to read/update all profiles and submissions.
-- Replace with your admin email(s) to match VITE_ADMIN_EMAILS in .env.
-- Example: INSERT INTO public.admin_users (email) VALUES ('you@example.com') ON CONFLICT (email) DO NOTHING;
INSERT INTO public.admin_users (email) VALUES ('maildavidharris591@gmail.com') ON CONFLICT (email) DO NOTHING;
