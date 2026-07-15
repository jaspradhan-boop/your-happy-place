import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Card, Progress } from "@/components/ui-bits";
import { ArrowLeft, Calendar, ClipboardList, DollarSign, Loader2, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/projects/$projectId")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Project — IntelliTeam AI" },
      { name: "description", content: "Project detail and administrative project controls." },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: ProjectDetail,
});

type Priority = "low" | "medium" | "high" | "critical";
type Status = "planned" | "in_progress" | "on_hold" | "completed" | "cancelled";

interface ProjectEntry {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  subtype: string;
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

const statusLabels: Record<Status, string> = {
  planned: "Planned",
  in_progress: "In progress",
  on_hold: "On hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

function ProjectDetail() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => { load(); }, [projectId]);

  async function load() {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;
    setUserId(user.id);
    const [{ data: roles }, { data, error }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", user.id),
      supabase.from("project_entries").select("*").eq("id", projectId).maybeSingle(),
    ]);
    setIsAdmin((roles ?? []).some((role) => role.role === "admin"));
    if (error) toast.error(error.message);
    setProject((data as ProjectEntry | null) ?? null);
    setLoading(false);
  }

  async function deleteProject() {
    if (!project) return;
    if (!confirm(`Delete project "${project.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("project_entries").delete().eq("id", project.id);
    if (error) return toast.error(error.message);
    toast.success("Project deleted");
    navigate({ to: "/projects" });
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground"><Loader2 className="mr-2 size-4 animate-spin" /> Loading project…</div>
      </AppShell>
    );
  }

  if (!project) {
    return (
      <AppShell>
        <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center text-sm text-muted-foreground">
          <ClipboardList className="size-8" />
          <div>Project not found or you do not have access to it.</div>
          <Link to="/projects" className="text-primary hover:underline">Back to projects</Link>
        </div>
      </AppShell>
    );
  }

  const canManage = isAdmin || project.user_id === userId;
  const progress = progressForStatus(project.status);

  return (
    <AppShell>
      <div className="mx-auto max-w-[1100px] p-4 sm:p-6">
        <Link to="/projects" className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground sm:mb-4">
          <ArrowLeft className="size-3.5" /> All projects
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{project.title}</h1>
              {isAdmin && <span className="inline-flex items-center gap-1 rounded bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary"><ShieldCheck className="size-3" /> Admin</span>}
            </div>
            {project.description && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{project.description}</p>}
          </div>
          {canManage && (
            <button onClick={deleteProject} className="flex items-center gap-1.5 self-start rounded-md border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20">
              <Trash2 className="size-3.5" /> Delete project
            </button>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4">
          <MetricCard label="Status" value={statusLabels[project.status]} />
          <MetricCard label="Priority" value={project.priority} />
          <MetricCard label="Budget" value={`$${Number(project.budget ?? 0).toLocaleString()}`} icon={<DollarSign className="size-3.5" />} />
          <MetricCard label="Hours" value={project.estimated_hours ?? "—"} />
        </div>

        <Card className="mt-6 p-5">
          <div className="mb-3 flex items-center justify-between text-xs">
            <span className="font-semibold">Progress</span>
            <span className="font-mono text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} tone={project.status === "completed" ? "success" : project.priority === "critical" ? "destructive" : "primary"} />
        </Card>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <h2 className="text-sm font-semibold">Project details</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <Info icon={<UserRound className="size-4" />} label="Owner" value={project.owner ?? "—"} />
              <Info label="Department" value={project.department ?? "—"} />
              <Info label="Category" value={project.category.replaceAll("_", " ")} />
              <Info label="Sub-type" value={project.subtype.replaceAll("_", " ")} />
              <Info icon={<Calendar className="size-4" />} label="Start date" value={project.start_date ? new Date(project.start_date).toLocaleDateString() : "—"} />
              <Info icon={<Calendar className="size-4" />} label="Due date" value={project.due_date ? new Date(project.due_date).toLocaleDateString() : "—"} />
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold">Notes and tags</h2>
            <p className="mt-3 min-h-16 text-sm leading-relaxed text-muted-foreground">{project.notes || "No notes added."}</p>
            {project.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1">
                {project.tags.map((tag) => <span key={tag} className="rounded bg-accent px-1.5 py-0.5 text-[10px] text-muted-foreground">#{tag}</span>)}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}<span>{label}</span></div>
      <div className="mt-2 truncate text-lg font-semibold capitalize">{value}</div>
    </Card>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-background/30 p-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">{icon}{label}</div>
      <div className="mt-1 capitalize text-sm font-medium">{value}</div>
    </div>
  );
}

function progressForStatus(status: Status) {
  if (status === "completed") return 100;
  if (status === "in_progress") return 50;
  if (status === "on_hold") return 35;
  if (status === "cancelled") return 0;
  return 10;
}