import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Card, Progress } from "@/components/ui-bits";
import { ClipboardList, Edit3, Filter, Loader2, Plus, Search, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/projects/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Projects — IntelliTeam AI" },
      { name: "description", content: "Manage real projects with admin controls for adding, editing, and deleting records." },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: ProjectsIndex,
});

type Category = "engineering_rd" | "new_dev_test_improvement";
type Subtype = "research" | "prototype" | "feasibility_study" | "design" | "new_development" | "testing" | "improvement";
type Priority = "low" | "medium" | "high" | "critical";
type Status = "planned" | "in_progress" | "on_hold" | "completed" | "cancelled";

interface ProjectEntry {
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

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "engineering_rd", label: "Engineering R&D" },
  { value: "new_dev_test_improvement", label: "New Development / Testing / Improvement" },
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

const inputCls = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary";

function ProjectsIndex() {
  const [projects, setProjects] = useState<ProjectEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState("");
  const [userId, setUserId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;

    setUserId(user.id);
    const [{ data: roles }, { data, error }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", user.id),
      supabase.from("project_entries").select("*").order("created_at", { ascending: false }),
    ]);

    setIsAdmin((roles ?? []).some((role) => role.role === "admin"));
    if (error) toast.error(error.message);
    else setProjects((data as ProjectEntry[]) ?? []);
    setLoading(false);
  }

  const filteredProjects = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return projects;
    return projects.filter((project) => [project.title, project.description, project.owner, project.department, project.tags.join(" ")]
      .some((value) => (value ?? "").toLowerCase().includes(term)));
  }, [projects, query]);

  function updateCategory(category: Category) {
    setForm((current) => ({ ...current, category, subtype: SUBTYPES[category][0].value }));
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function startEdit(project: ProjectEntry) {
    setEditingId(project.id);
    setForm({
      title: project.title,
      description: project.description ?? "",
      category: project.category,
      subtype: project.subtype,
      priority: project.priority,
      status: project.status,
      owner: project.owner ?? "",
      department: project.department ?? "",
      start_date: project.start_date ?? "",
      due_date: project.due_date ?? "",
      estimated_hours: project.estimated_hours?.toString() ?? "",
      budget: project.budget?.toString() ?? "",
      tags: project.tags.join(", "),
      notes: project.notes ?? "",
    });
    setShowForm(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);

    const payload = {
      user_id: userId,
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
      tags: form.tags ? form.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
      notes: form.notes.trim() || null,
    };

    const result = editingId
      ? await supabase.from("project_entries").update(payload).eq("id", editingId)
      : await supabase.from("project_entries").insert(payload);

    setSaving(false);
    if (result.error) return toast.error(result.error.message);

    toast.success(editingId ? "Project updated" : "Project added");
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    load();
  }

  async function deleteProject(project: ProjectEntry) {
    if (!confirm(`Delete project "${project.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("project_entries").delete().eq("id", project.id);
    if (error) return toast.error(error.message);
    toast.success("Project deleted");
    setProjects((current) => current.filter((item) => item.id !== project.id));
  }

  async function deleteAllManageableProjects() {
    const manageableIds = projects.filter((project) => isAdmin || project.user_id === userId).map((project) => project.id);
    if (manageableIds.length === 0) return;
    if (!confirm(`Delete ${manageableIds.length} project${manageableIds.length === 1 ? "" : "s"}? This cannot be undone.`)) return;
    const { error } = await supabase.from("project_entries").delete().in("id", manageableIds);
    if (error) return toast.error(error.message);
    toast.success("Projects deleted");
    setProjects((current) => current.filter((project) => !manageableIds.includes(project.id)));
  }

  const totalBudget = projects.reduce((sum, project) => sum + Number(project.budget ?? 0), 0);
  const activeCount = projects.filter((project) => project.status === "in_progress" || project.status === "planned").length;

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] p-4 sm:p-6">
        <div className="flex flex-col gap-3 pb-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4 sm:pb-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Projects</h1>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 rounded bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  <ShieldCheck className="size-3" /> Admin
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              {projects.length} projects · {activeCount} active/planned · ${totalBudget.toLocaleString()} budget
              {isAdmin && <span className="block text-primary/80 sm:inline"> · managing all users' projects</span>}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {projects.length > 0 && (
              <button onClick={deleteAllManageableProjects} className="flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20">
                <Trash2 className="size-3.5" /> Delete all
              </button>
            )}
            <button className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs hover:bg-accent"><Filter className="size-3.5" />Filter</button>
            <button onClick={startCreate} className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 sm:flex-none">
              <Plus className="size-3.5" /> New project
            </button>
          </div>
        </div>

        <div className="mb-5 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 sm:mb-6">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects, owners, departments, or tags…" className="min-w-0 flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none" />
        </div>

        {showForm && (
          <Card className="mb-6 p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">{editingId ? "Modify project" : "Add project"}</h2>
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }} className="rounded-md border border-border bg-card px-3 py-1.5 text-xs hover:bg-accent">Cancel</button>
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field label="Category *"><select value={form.category} onChange={(event) => updateCategory(event.target.value as Category)} className={inputCls}>{CATEGORIES.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}</select></Field>
                <Field label="Sub-type *"><select value={form.subtype} onChange={(event) => setForm({ ...form, subtype: event.target.value as Subtype })} className={inputCls}>{SUBTYPES[form.category].map((subtype) => <option key={subtype.value} value={subtype.value}>{subtype.label}</option>)}</select></Field>
              </div>
              <Field label="Title *"><input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={inputCls} placeholder="Project title" /></Field>
              <Field label="Description"><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={`${inputCls} min-h-[80px]`} placeholder="Scope, goals, deliverables…" /></Field>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Field label="Priority"><select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as Priority })} className={inputCls}>{PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}</select></Field>
                <Field label="Status"><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Status })} className={inputCls}>{STATUSES.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></Field>
                <Field label="Owner"><input value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })} className={inputCls} placeholder="Person / team" /></Field>
                <Field label="Department"><input value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} className={inputCls} placeholder="Department" /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Field label="Start date"><input type="date" value={form.start_date} onChange={(event) => setForm({ ...form, start_date: event.target.value })} className={inputCls} /></Field>
                <Field label="Due date"><input type="date" value={form.due_date} onChange={(event) => setForm({ ...form, due_date: event.target.value })} className={inputCls} /></Field>
                <Field label="Estimated hours"><input type="number" min="0" step="0.5" value={form.estimated_hours} onChange={(event) => setForm({ ...form, estimated_hours: event.target.value })} className={inputCls} /></Field>
                <Field label="Budget"><input type="number" min="0" step="0.01" value={form.budget} onChange={(event) => setForm({ ...form, budget: event.target.value })} className={inputCls} /></Field>
              </div>
              <Field label="Tags"><input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} className={inputCls} placeholder="plc, safety, testing" /></Field>
              <Field label="Notes"><textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className={`${inputCls} min-h-[60px]`} /></Field>
              <div className="flex justify-end">
                <button type="submit" disabled={saving} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {saving && <Loader2 className="size-3.5 animate-spin" />} {editingId ? "Save changes" : "Add project"}
                </button>
              </div>
            </form>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground"><Loader2 className="mr-2 size-4 animate-spin" /> Loading projects…</div>
        ) : filteredProjects.length === 0 ? (
          <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <ClipboardList className="size-8 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">No projects available</div>
              <div className="mt-1 text-xs text-muted-foreground">Add your first real project. No default or test projects are loaded.</div>
            </div>
            <button onClick={startCreate} className="mt-2 flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
              <Plus className="size-3.5" /> Add project
            </button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => {
              const canManage = isAdmin || project.user_id === userId;
              const status = STATUSES.find((item) => item.value === project.status)?.label ?? project.status;
              const progress = progressForStatus(project.status);
              return (
                <Link key={project.id} to="/projects/$projectId" params={{ projectId: project.id }}>
                  <Card className="group flex h-full flex-col p-4 transition hover:border-primary/40 hover:shadow-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded bg-primary/10 font-mono text-[10px] font-semibold text-primary">{initials(project.title)}</div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold leading-tight">{project.title}</div>
                          <div className="text-[11px] text-muted-foreground">{project.department || "No department"}</div>
                        </div>
                      </div>
                      {canManage && (
                        <div className="flex shrink-0 items-center gap-1">
                          <button onClick={(event) => { event.preventDefault(); event.stopPropagation(); startEdit(project); }} className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label={`Modify ${project.title}`}><Edit3 className="size-3.5" /></button>
                          <button onClick={(event) => { event.preventDefault(); event.stopPropagation(); deleteProject(project); }} className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-destructive" aria-label={`Delete ${project.title}`}><Trash2 className="size-3.5" /></button>
                        </div>
                      )}
                    </div>
                    {project.description && <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{project.description}</p>}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px]"><span className="text-muted-foreground">Progress</span><span className="font-mono">{progress}%</span></div>
                      <Progress value={progress} tone={project.status === "completed" ? "success" : project.priority === "critical" ? "destructive" : "primary"} />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 rounded-md border border-border bg-background/30 p-2 text-[11px]">
                      <div><span className="text-muted-foreground">Status:</span> <span className="font-medium">{status}</span></div>
                      <div><span className="text-muted-foreground">Priority:</span> <span className="font-medium capitalize">{project.priority}</span></div>
                      <div><span className="text-muted-foreground">Owner:</span> <span className="font-medium">{project.owner ?? "—"}</span></div>
                      <div><span className="text-muted-foreground">Budget:</span> <span className="font-medium">${Number(project.budget ?? 0).toLocaleString()}</span></div>
                    </div>
                    {project.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap items-center gap-1">
                        {project.tags.map((tag) => <span key={tag} className="rounded bg-accent px-1.5 py-0.5 text-[10px] text-muted-foreground">#{tag}</span>)}
                      </div>
                    )}
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-muted-foreground"><span className="mb-1 block">{label}</span>{children}</label>;
}

function progressForStatus(status: Status) {
  if (status === "completed") return 100;
  if (status === "in_progress") return 50;
  if (status === "on_hold") return 35;
  if (status === "cancelled") return 0;
  return 10;
}

function initials(title: string) {
  return title.split(/\s+/).map((part) => part[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "PR";
}