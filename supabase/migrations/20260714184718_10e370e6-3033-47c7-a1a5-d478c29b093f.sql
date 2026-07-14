
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'member');
CREATE TYPE public.profile_status AS ENUM ('pending', 'approved', 'rejected');

-- user_roles
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can read their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  status public.profile_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + auto-promote first user to admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  is_first boolean;
BEGIN
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles) INTO is_first;

  INSERT INTO public.profiles (id, email, full_name, status, approved_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    CASE WHEN is_first THEN 'approved'::public.profile_status ELSE 'pending'::public.profile_status END,
    CASE WHEN is_first THEN now() ELSE NULL END
  );

  IF is_first THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member');
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Extend project_entries so admins can manage anything, and approved members manage their own
CREATE POLICY "Admins can view all entries" ON public.project_entries
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update any entry" ON public.project_entries
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete any entry" ON public.project_entries
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert entries for anyone" ON public.project_entries
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Backfill: if any users already exist (e.g. tester), first one becomes admin + approved, rest pending members
DO $$
DECLARE
  u record;
  first_done boolean := false;
BEGIN
  FOR u IN SELECT id, email, raw_user_meta_data FROM auth.users ORDER BY created_at ASC LOOP
    INSERT INTO public.profiles (id, email, full_name, status, approved_at)
    VALUES (
      u.id, u.email,
      COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
      CASE WHEN NOT first_done THEN 'approved'::public.profile_status ELSE 'pending'::public.profile_status END,
      CASE WHEN NOT first_done THEN now() ELSE NULL END
    ) ON CONFLICT (id) DO NOTHING;

    IF NOT first_done THEN
      INSERT INTO public.user_roles (user_id, role) VALUES (u.id, 'admin') ON CONFLICT DO NOTHING;
      first_done := true;
    ELSE
      INSERT INTO public.user_roles (user_id, role) VALUES (u.id, 'member') ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;
