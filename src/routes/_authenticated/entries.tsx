import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui-bits";
import { Plus, Loader2, Trash2, LogOut, FlaskConical, Rocket, ClipboardList, Sparkles, ShieldCheck, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer, BarChart as RBarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";

export const Route = createFileRoute("/_authenticated/entries")({
  head: () => ({
    meta: [
      { title: "Project Entries — IntelliTeam AI" },
      { name: "description", content: "Log Engineering R&D, new development, testing, and improvement project entries." },
    ],
  }),
  component: EntriesPage,
});

type Category = "engineering_rd" | "new_dev_test_improvement";
type Subtype = "research" | "prototype" | "feasibility_study" | "design" | "new_development" | "testing" | "improvement";
type Priority = "low" | "medium" | "high" | "critical";
type Status = "planned" | "in_progress" | "on_hold" | "completed" | "cancelled";

interface Entry {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: Category;
  subtype: Subtype;
  priority: Priority;
  status: Status;
  owner: string | null;
  department: string | null;
  start_date: string | null;
  due_date: string | null;
  estimated_hours: number | null;
  budget: number | null;
  tags: string[];
  notes: string | null;
  created_at: string;
}

const CATEGORIES: { value: Category; label: string; icon: typeof FlaskConical }[] = [
  { value: "engineering_rd", label: "Engineering R&D and related project works", icon: FlaskConical },
  { value: "new_dev_test_improvement", label: "New Development / Testing / Improvement projects", icon: Rocket },
];

const SUBTYPES: Record<Category, { value: Subtype; label: string }[]> = {
  engineering_rd: [
    { value: "research", label: "Research" },
    { value: "prototype", label: "Prototype" },
    { value: "feasibility_study", label: "Feasibility Study" },
    { value: "design", label: "Design / Concept" },
  ],
  new_dev_test_improvement: [
    { value: "new_development", label: "New Development" },
    { value: "testing", label: "Testing / Validation" },
    { value: "improvement", label: "Improvement / Optimization" },
  ],
};

const PRIORITIES: Priority[] = ["low", "medium", "high", "critical"];
const STATUSES: { value: Status; label: string }[] = [
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In progress" },
  { value: "on_hold", label: "On hold" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const emptyForm = {
  title: "",
  description: "",
  category: "engineering_rd" as Category,
  subtype: "research" as Subtype,
  priority: "medium" as Priority,
  status: "planned" as Status,
  owner: "",
  department: "",
  start_date: "",
  due_date: "",
  estimated_hours: "",
  budget: "",
  tags: "",
  notes: "",
};

function EntriesPage() {
  const { user, isAdmin, status } = Route.useRouteContext();
  const navigate = useNavigate();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (status === "approved") load();
    else setLoading(false);
  }, [status]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("project_entries")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setEntries((data as Entry[]) ?? []);
    setLoading(false);
  }

  const subtypeOptions = useMemo(() => SUBTYPES[form.category], [form.category]);

  function updateCategory(cat: Category) {
    setForm((f) => ({ ...f, category: cat, subtype: SUBTYPES[cat][0].value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      user_id: user.id,
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category,
      subtype: form.subtype,
      priority: form.priority,
      status: form.status,
      owner: form.owner.trim() || null,
      department: form.department.trim() || null,
      start_date: form.start_date || null,
      due_date: form.due_date || null,
      estimated_hours: form.estimated_hours ? Number(form.estimated_hours) : null,
      budget: form.budget ? Number(form.budget) : null,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      notes: form.notes.trim() || null,
    };
    const { error } = await supabase.from("project_entries").insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Entry saved");
    setForm(emptyForm);
    setShowForm(false);
    load();
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("project_entries").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Entry deleted");
      setEntries((e) => e.filter((x) => x.id !== id));
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (status !== "approved") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-2xl">
          {status === "pending" ? (
            <>
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-warning/15 text-warning">
                <Clock className="size-6" />
              </div>
              <h1 className="mt-4 text-lg font-semibold">Awaiting admin approval</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Thanks for signing up. Your account (<span className="text-foreground">{user.email}</span>) is pending approval.
                An administrator must approve you before you can access the app.
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                <Trash2 className="size-6" />
              </div>
              <h1 className="mt-4 text-lg font-semibold">Access denied</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Your account has been rejected. Contact your administrator if you think this is a mistake.
              </p>
            </>
          )}
          <button onClick={handleSignOut} className="mt-6 inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs hover:bg-accent">
            <LogOut className="size-3.5" /> Sign out
          </button>
        </div>
      </div>
    );
  }

  const rdCount = entries.filter((e) => e.category === "engineering_rd").length;
  const devCount = entries.filter((e) => e.category === "new_dev_test_improvement").length;

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] p-6">
        <div className="flex flex-wrap items-end justify-between gap-4 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">Project Entries</h1>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 rounded bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  <ShieldCheck className="size-3" /> Admin
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Signed in as <span className="text-foreground">{user.email}</span> · {entries.length} entries · {rdCount} R&D · {devCount} Dev/Test/Improvement
              {isAdmin && " · viewing ALL users' entries"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowForm((s) => !s)}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="size-3.5" /> New entry
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs hover:bg-accent"
            >
              <LogOut className="size-3.5" /> Sign out
            </button>
          </div>
        </div>

        {showForm && (
          <Card className="mb-6 p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field label="Category *">
                  <select value={form.category} onChange={(e) => updateCategory(e.target.value as Category)} className={inputCls}>
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </Field>
                <Field label="Sub-type *">
                  <select value={form.subtype} onChange={(e) => setForm({ ...form, subtype: e.target.value as Subtype })} className={inputCls}>
                    {subtypeOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Title *">
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls}
                  placeholder="e.g. PLC firmware regression testing for Line 4" />
              </Field>

              <Field label="Description">
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`${inputCls} min-h-[80px]`} placeholder="Scope, goals, deliverables…" />
              </Field>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Field label="Priority">
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })} className={inputCls}>
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Status">
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Status })} className={inputCls}>
                    {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </Field>
                <Field label="Owner">
                  <input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} className={inputCls} placeholder="Person / team" />
                </Field>
                <Field label="Department">
                  <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className={inputCls} placeholder="e.g. Automation" />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Field label="Start date">
                  <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Due date">
                  <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Estimated hours">
                  <input type="number" min="0" step="0.5" value={form.estimated_hours} onChange={(e) => setForm({ ...form, estimated_hours: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Budget (USD)">
                  <input type="number" min="0" step="0.01" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className={inputCls} />
                </Field>
              </div>

              <Field label="Tags (comma-separated)">
                <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputCls} placeholder="plc, safety, vision" />
              </Field>

              <Field label="Notes">
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`${inputCls} min-h-[60px]`} placeholder="Anything else…" />
              </Field>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); }} className="rounded-md border border-border bg-card px-3 py-1.5 text-xs hover:bg-accent">Cancel</button>
                <button type="submit" disabled={saving} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {saving && <Loader2 className="size-3.5 animate-spin" />} Save entry
                </button>
              </div>
            </form>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground"><Loader2 className="mr-2 size-4 animate-spin" /> Loading entries…</div>
        ) : entries.length === 0 ? (
          <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <ClipboardList className="size-8 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">No entries yet</div>
              <div className="mt-1 text-xs text-muted-foreground">Create your first Engineering R&D or Development entry.</div>
            </div>
            <button onClick={() => setShowForm(true)} className="mt-2 flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
              <Plus className="size-3.5" /> Create entry
            </button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {entries.map((e) => {
              const cat = CATEGORIES.find((c) => c.value === e.category)!;
              const sub = SUBTYPES[e.category].find((s) => s.value === e.subtype);
              const Icon = cat.icon;
              return (
                <Card key={e.id} className="flex flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 flex size-8 items-center justify-center rounded bg-primary/10 text-primary">
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold leading-tight">{e.title}</div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">
                          {cat.label.split(" and ")[0]} · {sub?.label}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(e.id)} className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-destructive">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  {e.description && <p className="line-clamp-3 text-xs text-muted-foreground">{e.description}</p>}

                  <div className="grid grid-cols-2 gap-2 rounded-md border border-border bg-background/30 p-2 text-[11px]">
                    <div><span className="text-muted-foreground">Status:</span> <span className="font-medium">{STATUSES.find(s=>s.value===e.status)?.label}</span></div>
                    <div><span className="text-muted-foreground">Priority:</span> <span className="font-medium capitalize">{e.priority}</span></div>
                    <div><span className="text-muted-foreground">Owner:</span> <span className="font-medium">{e.owner ?? "—"}</span></div>
                    <div><span className="text-muted-foreground">Dept:</span> <span className="font-medium">{e.department ?? "—"}</span></div>
                    {e.due_date && <div className="col-span-2"><span className="text-muted-foreground">Due:</span> <span className="font-medium">{new Date(e.due_date).toLocaleDateString()}</span></div>}
                  </div>

                  {e.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {e.tags.map((t) => (
                        <span key={t} className="rounded bg-accent px-1.5 py-0.5 text-[10px] text-muted-foreground">#{t}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-auto flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Sparkles className="size-3 text-primary" />
                    Logged {new Date(e.created_at).toLocaleString()}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

const inputCls = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-medium text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}
