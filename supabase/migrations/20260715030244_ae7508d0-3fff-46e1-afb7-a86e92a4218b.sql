
CREATE TYPE public.proposal_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'rejected');

CREATE TABLE public.budget_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fiscal_year INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category public.entry_category NOT NULL,
  department TEXT,
  hardware_cost NUMERIC NOT NULL DEFAULT 0,
  software_cost NUMERIC NOT NULL DEFAULT 0,
  service_cost NUMERIC NOT NULL DEFAULT 0,
  hardware_notes TEXT,
  software_notes TEXT,
  service_notes TEXT,
  justification TEXT,
  priority public.entry_priority NOT NULL DEFAULT 'medium',
  status public.proposal_status NOT NULL DEFAULT 'draft',
  reviewer_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.budget_proposals TO authenticated;
GRANT ALL ON public.budget_proposals TO service_role;

ALTER TABLE public.budget_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own proposals" ON public.budget_proposals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own proposals" ON public.budget_proposals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own proposals" ON public.budget_proposals FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own proposals" ON public.budget_proposals FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins view all proposals" ON public.budget_proposals FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update any proposal" ON public.budget_proposals FOR UPDATE USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete any proposal" ON public.budget_proposals FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert proposals for anyone" ON public.budget_proposals FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_budget_proposals_updated_at BEFORE UPDATE ON public.budget_proposals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_budget_proposals_user ON public.budget_proposals(user_id);
CREATE INDEX idx_budget_proposals_year ON public.budget_proposals(fiscal_year);
CREATE INDEX idx_budget_proposals_status ON public.budget_proposals(status);
