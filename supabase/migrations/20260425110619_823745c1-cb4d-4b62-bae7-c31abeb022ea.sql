
-- Maturity rating enum
CREATE TYPE public.maturity_rating AS ENUM ('kids', 'teen', 'adult');

-- Accounts table (1:1 with auth.users)
CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  onboarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Viewing profiles (Netflix-style, up to 5 per account)
CREATE TABLE public.viewing_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'en',
  maturity_rating public.maturity_rating NOT NULL DEFAULT 'adult',
  is_kids BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_viewing_profiles_user ON public.viewing_profiles(user_id);

-- Limit to 5 profiles per user
CREATE OR REPLACE FUNCTION public.enforce_profile_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT COUNT(*) FROM public.viewing_profiles WHERE user_id = NEW.user_id) >= 5 THEN
    RAISE EXCEPTION 'Maximum of 5 profiles per account';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_profile_limit
BEFORE INSERT ON public.viewing_profiles
FOR EACH ROW EXECUTE FUNCTION public.enforce_profile_limit();

-- Updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_accounts_updated_at
BEFORE UPDATE ON public.accounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_viewing_profiles_updated_at
BEFORE UPDATE ON public.viewing_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create account + default profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name TEXT;
BEGIN
  v_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.accounts (user_id, display_name)
  VALUES (NEW.id, v_name);

  INSERT INTO public.viewing_profiles (user_id, name, avatar_url)
  VALUES (NEW.id, v_name, '');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viewing_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own account" ON public.accounts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own account" ON public.accounts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own account" ON public.accounts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own profiles" ON public.viewing_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profiles" ON public.viewing_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profiles" ON public.viewing_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own profiles" ON public.viewing_profiles
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
