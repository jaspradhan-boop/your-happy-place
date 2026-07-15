import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui-bits";
import { Plus, Loader2, Trash2, Wallet, Cpu, Package, Wrench, Sparkles, CheckCircle2, XCircle, Clock, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/budget")({
  head: () => ({
    meta: [
      { title: "Next Year Budget — IntelliTeam AI" },
      { name: "description", content: "Propose next year's projects with estimated hardware, software, and service costs." },
    ],
  }),
  component: BudgetPage,
});

type Category = "engineering_rd" | "new_dev_test_improvement";
type Priority = "low" | "medium" | "high" | "critical";
type ProposalStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected";

interface Proposal {
  id: string;
  user_id: string;
  fiscal_year: number;
  title: string;
  description: string | null;
  category: Category;
  department: string | null;
  hardware_cost: number;
  software_cost: number;
  service_cost: number;
  hardware_notes: string | null;
  software_notes: string | null;
  service_notes: string | null;
  justification: string | null;
  priority: Priority;
  status: ProposalStatus;
  reviewer_notes: string | null;
  created_at: string;
}

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "engineering_rd", label: "Engineering R&D and related project works" },
  { value: "new_dev_test_improvement", label: "New Development / Testing / Improvement" },
];
const PRIORITIES: Priority[] = ["low", "medium", "high", "critical"];
const STATUS_META: Record<ProposalStatus, { label: string; tone: string; Icon: typeof Clock }> = {
  draft: { label: "Draft", tone: "bg-muted text-muted-foreground", Icon: Clock },
  submitted: { label: "Submitted", tone: "bg-primary/15 text-primary", Icon: Send },
  under_review: { label: "Under review", tone: "bg-warning/15 text-warning", Icon: Clock },
  approved: { label: "Approved", tone: "bg-success/15 text-success", Icon: CheckCircle2 },
  rejected: { label: "Rejected", tone: "bg-destructive/15 text-destructive", Icon: XCircle },
};

const nextYear = new Date().getFullYear() + 1;

const emptyForm = {
  fiscal_year: nextYear,
  title: "",
  description: "",
  category: "engineering_rd" as Category,
  department: "",
  priority: "medium" as Priority,
  hardware_cost: "",
  software_cost: "",
  service_cost: "",
  hardware_notes: "",
  software_notes: "",
  service_notes: "",
  justification: "",
};

function fmtMoney(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);
}

function BudgetPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [filterYear, setFilterYear] = useState<number>(nextYear);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        const { data } = await supabase.from("user_roles").select("role").eq("user_id", userData.user.id);
        setIsAdmin((data ?? []).some((r) => r.role === "admin"));
      }
      await load();
    })();
  }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("budget_proposals").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setProposals((data as Proposal[]) ?? []);
    setLoading(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { setSaving(false); return toast.error("Not signed in"); }
    const payload = {
      user_id: userData.user.id,
      fiscal_year: Number(form.fiscal_year) || nextYear,
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category,
      department: form.department.trim() || null,
      priority: form.priority,
      hardware_cost: Number(form.hardware_cost) || 0,
      software_cost: Number(form.software_cost) || 0,
      service_cost: Number(form.service_cost) || 0,
      hardware_notes: form.hardware_notes.trim() || null,
      software_notes: form.software_notes.trim() || null,
      service_notes: form.service_notes.trim() || null,
      justification: form.justification.trim() || null,
      status: "submitted" as ProposalStatus,
    };
    const { error } = await supabase.from("budget_proposals").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Budget proposal submitted");
    setForm(emptyForm);
    setShowForm(false);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this proposal?")) return;
    const { error } = await supabase.from("budget_proposals").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  }

  async function updateStatus(id: string, status: ProposalStatus) {
    const { error } = await supabase.from("budget_proposals").update({ status, reviewed_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${STATUS_META[status].label.toLowerCase()}`);
    load();
  }

  const years = useMemo(() => {
    const set = new Set<number>([nextYear]);
    proposals.forEach((p) => set.add(p.fiscal_year));
    return Array.from(set).sort((a, b) => b - a);
  }, [proposals]);

  const filtered = proposals.filter((p) => p.fiscal_year === filterYear);
  const totals = filtered.reduce(
    (acc, p) => {
      acc.hw += Number(p.hardware_cost) || 0;
      acc.sw += Number(p.software_cost) || 0;
      acc.sv += Number(p.service_cost) || 0;
      return acc;
    },
    { hw: 0, sw: 0, sv: 0 },
  );
  const grand = totals.hw + totals.sw + totals.sv;

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] p-3 sm:p-6">
        <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-end sm:justify-between sm:pb-6">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
              <Wallet className="size-5 text-primary" /> Next Year Budget
            </h1>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Propose projects for FY{nextYear} with estimated hardware, software, and service costs.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(Number(e.target.value))}
              className="rounded-md border border-border bg-card px-2 py-1.5 text-xs"
            >
              {years.map((y) => <option key={y} value={y}>FY {y}</option>)}
            </select>
            <button
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="size-3.5" /> New proposal
            </button>
          </div>
        </div>

        {/* KPI Strip */}
        <div className="mb-4 grid grid-cols-2 gap-2 sm:mb-6 sm:grid-cols-4 sm:gap-3">
          <KpiCard icon={Cpu} label="Hardware" value={fmtMoney(totals.hw)} tone="text-primary" />
          <KpiCard icon={Package} label="Software" value={fmtMoney(totals.sw)} tone="text-warning" />
          <KpiCard icon={Wrench} label="Services" value={fmtMoney(totals.sv)} tone="text-success" />
          <KpiCard icon={Sparkles} label={`Total FY${filterYear}`} value={fmtMoney(grand)} tone="text-foreground" highlight />
        </div>

        {showForm && (
          <Card className="mb-4 p-4 sm:mb-6 sm:p-5">
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Project title *">
                  <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="input" placeholder="e.g. Robotics test cell upgrade" />
                </Field>
                <Field label="Fiscal year">
                  <input type="number" value={form.fiscal_year} onChange={(e) => setForm({ ...form, fiscal_year: Number(e.target.value) })}
                    className="input" />
                </Field>
                <Field label="Category">
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })} className="input">
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </Field>
                <Field label="Priority">
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })} className="input">
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Department">
                  <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input" placeholder="e.g. Engineering" />
                </Field>
              </div>

              <Field label="Description">
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" />
              </Field>

              <div className="rounded-md border border-border bg-background/40 p-3 sm:p-4">
                <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Estimated costs</div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <CostField icon={Cpu} label="Hardware ($)" value={form.hardware_cost} notes={form.hardware_notes}
                    onValue={(v) => setForm({ ...form, hardware_cost: v })}
                    onNotes={(v) => setForm({ ...form, hardware_notes: v })}
                    placeholder="Servers, sensors, robots…" />
                  <CostField icon={Package} label="Software ($)" value={form.software_cost} notes={form.software_notes}
                    onValue={(v) => setForm({ ...form, software_cost: v })}
                    onNotes={(v) => setForm({ ...form, software_notes: v })}
                    placeholder="Licenses, SaaS, tools…" />
                  <CostField icon={Wrench} label="Services ($)" value={form.service_cost} notes={form.service_notes}
                    onValue={(v) => setForm({ ...form, service_cost: v })}
                    onNotes={(v) => setForm({ ...form, service_notes: v })}
                    placeholder="Contractors, training…" />
                </div>
                <div className="mt-3 flex items-center justify-end gap-2 border-t border-border pt-3 text-sm">
                  <span className="text-muted-foreground">Proposal total</span>
                  <span className="font-mono font-semibold">
                    {fmtMoney((Number(form.hardware_cost) || 0) + (Number(form.software_cost) || 0) + (Number(form.service_cost) || 0))}
                  </span>
                </div>
              </div>

              <Field label="Business justification">
                <textarea rows={3} value={form.justification} onChange={(e) => setForm({ ...form, justification: e.target.value })}
                  className="input" placeholder="Expected outcome, ROI, alignment with strategy…" />
              </Field>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); }} className="rounded-md border border-border bg-card px-3 py-1.5 text-xs hover:bg-accent">Cancel</button>
                <button type="submit" disabled={saving} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                  {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                  Submit proposal
                </button>
              </div>
            </form>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Loading proposals…</div>
        ) : filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <Wallet className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No proposals for FY{filterYear} yet.</p>
            <button onClick={() => setShowForm(true)} className="mt-3 text-xs text-primary hover:underline">Create the first proposal</button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => {
              const total = Number(p.hardware_cost) + Number(p.software_cost) + Number(p.service_cost);
              const meta = STATUS_META[p.status];
              const Icon = meta.Icon;
              return (
                <Card key={p.id} className="flex flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold leading-tight">{p.title}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        FY{p.fiscal_year} · {CATEGORIES.find((c) => c.value === p.category)?.label.split(" ")[0]} · {p.department || "—"}
                      </div>
                    </div>
                    <span className={`flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium ${meta.tone}`}>
                      <Icon className="size-3" /> {meta.label}
                    </span>
                  </div>

                  {p.description && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>}

                  <div className="mt-3 space-y-1.5 rounded-md border border-border bg-background/40 p-2.5 text-xs">
                    <Row icon={Cpu} label="Hardware" value={fmtMoney(Number(p.hardware_cost))} tone="text-primary" />
                    <Row icon={Package} label="Software" value={fmtMoney(Number(p.software_cost))} tone="text-warning" />
                    <Row icon={Wrench} label="Services" value={fmtMoney(Number(p.service_cost))} tone="text-success" />
                    <div className="mt-1 flex items-center justify-between border-t border-border pt-1.5 font-semibold">
                      <span>Total</span>
                      <span className="font-mono">{fmtMoney(total)}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Priority: {p.priority}</span>
                    <div className="flex items-center gap-1">
                      {isAdmin && p.status !== "approved" && (
                        <button onClick={() => updateStatus(p.id, "approved")} className="rounded p-1 text-success hover:bg-success/10" title="Approve"><CheckCircle2 className="size-4" /></button>
                      )}
                      {isAdmin && p.status !== "rejected" && (
                        <button onClick={() => updateStatus(p.id, "rejected")} className="rounded p-1 text-destructive hover:bg-destructive/10" title="Reject"><XCircle className="size-4" /></button>
                      )}
                      <button onClick={() => remove(p.id)} className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title="Delete"><Trash2 className="size-4" /></button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .input { width: 100%; border-radius: 0.375rem; border: 1px solid hsl(var(--border)); background: hsl(var(--card)); padding: 0.5rem 0.625rem; font-size: 0.8125rem; }
        .input:focus { outline: 2px solid hsl(var(--primary) / 0.4); outline-offset: -1px; }
      `}</style>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function CostField({ icon: Icon, label, value, notes, onValue, onNotes, placeholder }: {
  icon: typeof Cpu; label: string; value: string; notes: string;
  onValue: (v: string) => void; onNotes: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-2.5">
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <input type="number" min="0" step="any" value={value} onChange={(e) => onValue(e.target.value)}
        className="input" placeholder="0" />
      <input value={notes} onChange={(e) => onNotes(e.target.value)}
        className="input mt-1.5" placeholder={placeholder || "Notes"} />
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, tone, highlight }: {
  icon: typeof Wallet; label: string; value: string; tone: string; highlight?: boolean;
}) {
  return (
    <Card className={`p-3 sm:p-4 ${highlight ? "border-primary/40 bg-primary/5" : ""}`}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className={`size-3.5 ${tone}`} /> {label}
      </div>
      <div className={`mt-1 font-mono text-lg font-semibold sm:text-xl ${tone}`}>{value}</div>
    </Card>
  );
}

function Row({ icon: Icon, label, value, tone }: { icon: typeof Cpu; label: string; value: string; tone: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`flex items-center gap-1.5 ${tone}`}><Icon className="size-3" /> {label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}
