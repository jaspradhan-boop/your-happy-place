
CREATE TYPE public.entry_category AS ENUM ('engineering_rd', 'new_dev_test_improvement');
CREATE TYPE public.entry_subtype AS ENUM (
  'research', 'prototype', 'feasibility_study', 'design',
  'new_development', 'testing', 'improvement'
);
CREATE TYPE public.entry_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.entry_status AS ENUM ('planned', 'in_progress', 'on_hold', 'completed', 'cancelled');

CREATE TABLE public.project_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category public.entry_category NOT NULL,
  subtype public.entry_subtype NOT NULL,
  priority public.entry_priority NOT NULL DEFAULT 'medium',
  status public.entry_status NOT NULL DEFAULT 'planned',
  owner TEXT,
  department TEXT,
  start_date DATE,
  due_date DATE,
  estimated_hours NUMERIC(10,2),
  budget NUMERIC(14,2),
  tags TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_entries TO authenticated;
GRANT ALL ON public.project_entries TO service_role;

ALTER TABLE public.project_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own entries"
  ON public.project_entries FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own entries"
  ON public.project_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own entries"
  ON public.project_entries FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own entries"
  ON public.project_entries FOR DELETE
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_project_entries_updated_at
  BEFORE UPDATE ON public.project_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX project_entries_user_created_idx ON public.project_entries (user_id, created_at DESC);
