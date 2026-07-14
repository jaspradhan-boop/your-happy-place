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
      <div className="mx-auto max-w-[1400px] p-4 sm:p-6">
        <div className="flex flex-col gap-3 pb-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4 sm:pb-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Project Entries</h1>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 rounded bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  <ShieldCheck className="size-3" /> Admin
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              <span className="block truncate sm:inline">Signed in as <span className="text-foreground">{user.email}</span></span>
              <span className="hidden sm:inline"> · </span>
              <span>{entries.length} entries · {rdCount} R&D · {devCount} Dev/Test</span>
              {isAdmin && <span className="block text-primary/80 sm:inline"> · viewing ALL users' entries</span>}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowForm((s) => !s)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 sm:flex-none sm:py-1.5"
            >
              <Plus className="size-3.5" /> New entry
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-2 text-xs hover:bg-accent sm:py-1.5"
            >
              <LogOut className="size-3.5" /> Sign out
            </button>
          </div>
        </div>

        {entries.length > 0 && <AnalyticsPanel entries={entries} />}


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

// ---------------- Analytics ----------------

const STATUS_COLORS: Record<Status, string> = {
  planned: "oklch(0.65 0.02 260)",
  in_progress: "oklch(0.72 0.16 265)",
  on_hold: "oklch(0.78 0.15 78)",
  completed: "oklch(0.72 0.15 152)",
  cancelled: "oklch(0.62 0.22 22)",
};

const PRIORITY_COLORS: Record<Priority, string> = {
  low: "oklch(0.65 0.02 260)",
  medium: "oklch(0.72 0.16 265)",
  high: "oklch(0.78 0.15 78)",
  critical: "oklch(0.62 0.22 22)",
};

function AnalyticsPanel({ entries }: { entries: Entry[] }) {
  const statusData = useMemo(() =>
    STATUSES.map((s) => ({
      name: s.label,
      key: s.value,
      value: entries.filter((e) => e.status === s.value).length,
    })).filter((d) => d.value > 0),
  [entries]);

  const categoryData = useMemo(() => {
    const rd = entries.filter((e) => e.category === "engineering_rd");
    const dv = entries.filter((e) => e.category === "new_dev_test_improvement");
    return [
      { name: "R&D", entries: rd.length, hours: rd.reduce((s, e) => s + (e.estimated_hours ?? 0), 0), budget: rd.reduce((s, e) => s + (e.budget ?? 0), 0) },
      { name: "Dev/Test", entries: dv.length, hours: dv.reduce((s, e) => s + (e.estimated_hours ?? 0), 0), budget: dv.reduce((s, e) => s + (e.budget ?? 0), 0) },
    ];
  }, [entries]);

  const priorityData = useMemo(() =>
    PRIORITIES.map((p) => ({
      name: p.charAt(0).toUpperCase() + p.slice(1),
      key: p,
      count: entries.filter((e) => e.priority === p).length,
    })),
  [entries]);

  const trendData = useMemo(() => {
    // Group by day for the last 14 days
    const days: { label: string; date: string; count: number }[] = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        date: key,
        count: entries.filter((e) => e.created_at.slice(0, 10) === key).length,
      });
    }
    return days;
  }, [entries]);

  const totalHours = entries.reduce((s, e) => s + (e.estimated_hours ?? 0), 0);
  const totalBudget = entries.reduce((s, e) => s + (e.budget ?? 0), 0);
  const completed = entries.filter((e) => e.status === "completed").length;
  const completionPct = entries.length > 0 ? Math.round((completed / entries.length) * 100) : 0;

  return (
    <div className="mb-6 space-y-3 sm:space-y-4">
      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        <Kpi label="Total entries" value={entries.length.toString()} />
        <Kpi label="Completion" value={`${completionPct}%`} tone="success" />
        <Kpi label="Est. hours" value={totalHours.toLocaleString()} />
        <Kpi label="Budget" value={`$${(totalBudget / 1000).toFixed(1)}k`} tone="primary" />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">
        <ChartCard title="Entries by status" subtitle="Distribution across the portfolio">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                innerRadius={48}
                outerRadius={78}
                paddingAngle={2}
                stroke="hsl(var(--background))"
                strokeWidth={2}
              >
                {statusData.map((d) => (
                  <Cell key={d.key} fill={STATUS_COLORS[d.key as Status]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                itemStyle={{ color: "hsl(var(--foreground))" }}
                cursor={false}
              />
            </PieChart>
          </ResponsiveContainer>
          <Legend items={statusData.map((d) => ({ label: d.name, color: STATUS_COLORS[d.key as Status], value: d.value }))} />
        </ChartCard>

        <ChartCard title="R&D vs Dev/Test" subtitle="Entries, estimated hours">
          <ResponsiveContainer width="100%" height={220}>
            <RBarChart data={categoryData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--accent))", opacity: 0.4 }} />
              <Bar dataKey="entries" fill="oklch(0.72 0.16 265)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="hours" fill="oklch(0.78 0.15 78)" radius={[6, 6, 0, 0]} />
            </RBarChart>
          </ResponsiveContainer>
          <Legend items={[
            { label: "Entries", color: "oklch(0.72 0.16 265)" },
            { label: "Est. hours", color: "oklch(0.78 0.15 78)" },
          ]} />
        </ChartCard>

        <ChartCard title="Priority mix" subtitle="Count per priority level">
          <ResponsiveContainer width="100%" height={220}>
            <RBarChart data={priorityData} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} width={64} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--accent))", opacity: 0.4 }} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {priorityData.map((d) => (
                  <Cell key={d.key} fill={PRIORITY_COLORS[d.key as Priority]} />
                ))}
              </Bar>
            </RBarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Entry velocity" subtitle="Entries created per day · last 14 days">
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={trendData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="entryGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.72 0.16 265)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="oklch(0.72 0.16 265)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={20} />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} width={30} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "hsl(var(--primary))", strokeOpacity: 0.3 }} />
            <Area type="monotone" dataKey="count" stroke="oklch(0.72 0.16 265)" strokeWidth={2} fill="url(#entryGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

const tooltipStyle: React.CSSProperties = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  padding: "6px 10px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
};

function Kpi({ label, value, tone }: { label: string; value: string; tone?: "success" | "primary" }) {
  const toneCls = tone === "success" ? "text-success" : tone === "primary" ? "text-primary" : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5 sm:px-4 sm:py-3">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 text-lg font-semibold tracking-tight sm:text-2xl ${toneCls}`}>{value}</div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Card className="p-3 sm:p-4">
      <div className="mb-2">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </Card>
  );
}

function Legend({ items }: { items: { label: string; color: string; value?: number }[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span className="size-2 rounded-sm" style={{ backgroundColor: i.color }} />
          {i.label}{i.value !== undefined && <span className="font-mono text-foreground">· {i.value}</span>}
        </span>
      ))}
    </div>
  );
}

