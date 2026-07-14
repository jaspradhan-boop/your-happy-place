import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, ProjectStatusBadge, PriorityBadge, Progress, AvatarStack, SectionHeader, TaskStatusChip, TASK_STATUSES, taskStatusColor, taskStatusLabel } from "@/components/ui-bits";
import { memberById, projectById, tasksByProject, members } from "@/lib/mock-data";
import { ArrowLeft, Calendar, DollarSign, MessageSquare, Paperclip, Plus, Sparkles, TrendingUp, ShieldAlert, GitBranch, FileText, MoreHorizontal, Timer } from "lucide-react";

export const Route = createFileRoute("/projects/$projectId")({
  loader: ({ params }) => {
    const p = projectById(params.projectId);
    if (!p) throw notFound();
    return { project: p };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.project ? `${loaderData.project.name} — IntelliTeam AI` : "Project — IntelliTeam AI" },
      { name: "description", content: loaderData?.project?.description ?? "Project detail" },
    ],
  }),
  notFoundComponent: () => (
    <AppShell>
      <div className="flex h-full items-center justify-center p-8 text-sm text-muted-foreground">Project not found. <Link to="/projects" className="ml-2 text-primary hover:underline">Back to projects</Link></div>
    </AppShell>
  ),
  errorComponent: ({ error }) => (
    <AppShell>
      <div className="p-8 text-sm text-destructive">Failed to load project: {error.message}</div>
    </AppShell>
  ),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { project } = Route.useLoaderData();
  const tasks = tasksByProject(project.id);
  const manager = memberById(project.managerId);
  const teamMembers = project.memberIds.map(id => memberById(id));
  const healthTone = project.health >= 80 ? "success" : project.health >= 65 ? "primary" : project.health >= 50 ? "warning" : "destructive";

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] p-6">
        {/* Header */}
        <Link to="/projects" className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> All projects
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex size-11 items-center justify-center rounded-md bg-primary/10 font-mono text-xs font-semibold text-primary">{project.key}</div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
                <ProjectStatusBadge status={project.status} />
                <PriorityBadge priority={project.priority} />
              </div>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{project.description}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><GitBranch className="size-3" /> {project.department}</span>
                <span className="flex items-center gap-1"><Calendar className="size-3" /> {new Date(project.startDate).toLocaleDateString()} – {new Date(project.dueDate).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><DollarSign className="size-3" /> ${(project.spent / 1000).toFixed(0)}k / ${(project.budget / 1000).toFixed(0)}k</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AvatarStack items={teamMembers.map(m => ({ initials: m.initials, color: m.avatarColor }))} max={6} />
            <button className="rounded-md border border-border bg-card p-1.5 hover:bg-accent"><MoreHorizontal className="size-4 text-muted-foreground" /></button>
            <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"><Plus className="size-3.5" />Add task</button>
          </div>
        </div>

        {/* Metrics + AI forecast */}
        <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1fr_1fr_1.4fr]">
          <MetricCard label="Progress" value={`${project.progress}%`}>
            <Progress value={project.progress} tone={healthTone} className="mt-2" />
          </MetricCard>
          <MetricCard label="Health score" value={project.health} sub={project.health >= 75 ? "Healthy" : "Watch"} tone={project.health >= 75 ? "success" : "warning"} icon={<TrendingUp className="size-3.5" />} />
          <MetricCard label="Risk index" value={project.risk} sub={project.risk <= 30 ? "Low" : project.risk <= 55 ? "Moderate" : "Elevated"} tone={project.risk <= 30 ? "success" : project.risk <= 55 ? "warning" : "destructive"} icon={<ShieldAlert className="size-3.5" />} />
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <div className="text-xs font-semibold tracking-tight">AI forecast</div>
              <span className="ml-auto rounded bg-primary/15 px-1.5 py-px text-[10px] font-semibold text-primary">
                {Math.round(project.aiForecast.confidence * 100)}% confidence
              </span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Predicted completion</div>
                <div className="mt-0.5 font-mono text-sm">{new Date(project.aiForecast.completion).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Delta vs plan</div>
                <div className={`mt-0.5 font-mono text-sm ${project.aiForecast.predictedDelay > 0 ? "text-destructive" : "text-success"}`}>
                  {project.aiForecast.predictedDelay > 0 ? `+${project.aiForecast.predictedDelay}d` : `${project.aiForecast.predictedDelay}d`}
                </div>
              </div>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{project.aiForecast.recommendation}</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex items-center gap-1 border-b border-border">
          {["Kanban", "Timeline", "Files", "Discussion", "Activity"].map((t, i) => (
            <button key={t} className={`relative px-3 py-2 text-xs font-medium transition ${i === 0 ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {t}
              {i === 0 && <span className="absolute inset-x-3 -bottom-px h-0.5 bg-primary" />}
            </button>
          ))}
        </div>

        {/* Kanban */}
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          {TASK_STATUSES.map((status) => {
            const columnTasks = tasks.filter(t => t.status === status);
            return (
              <div key={status} className="flex min-h-[400px] flex-col rounded-lg border border-border bg-background/30">
                <div className="flex items-center justify-between border-b border-border px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ backgroundColor: taskStatusColor(status) }} />
                    <span className="text-xs font-semibold">{taskStatusLabel(status)}</span>
                    <span className="rounded bg-muted px-1.5 text-[10px] text-muted-foreground">{columnTasks.length}</span>
                  </div>
                  <button className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"><Plus className="size-3.5" /></button>
                </div>
                <div className="flex-1 space-y-2 overflow-auto scrollbar-thin p-2">
                  {columnTasks.length === 0 && (
                    <div className="mt-4 text-center text-[11px] text-muted-foreground/60">No tasks</div>
                  )}
                  {columnTasks.map(t => {
                    const m = memberById(t.assigneeId);
                    return (
                      <Card key={t.id} className="cursor-pointer p-2.5 transition hover:border-primary/40">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-xs font-medium leading-snug">{t.title}</div>
                          <PriorityBadge priority={t.priority} />
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {t.tags.map(tag => (
                            <span key={tag} className="rounded bg-muted px-1.5 py-px text-[10px] text-muted-foreground">{tag}</span>
                          ))}
                        </div>
                        {t.progress > 0 && t.progress < 100 && (
                          <div className="mt-2">
                            <Progress value={t.progress} />
                          </div>
                        )}
                        {t.aiSuggestion && (
                          <div className="mt-2 flex items-start gap-1.5 rounded border border-primary/20 bg-primary/5 p-1.5">
                            <Sparkles className="mt-0.5 size-3 shrink-0 text-primary" />
                            <p className="text-[10px] leading-snug text-muted-foreground">{t.aiSuggestion}</p>
                          </div>
                        )}
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex size-5 items-center justify-center rounded-full text-[9px] font-semibold text-background" style={{ backgroundColor: m.avatarColor }}>{m.initials}</div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-0.5"><Timer className="size-3" />{t.estimateHours}h</span>
                            <span>· {new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom: team + docs */}
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="border-b border-border p-4"><SectionHeader title="Team" subtitle={`${teamMembers.length} members · led by ${manager.name}`} /></div>
            <div className="grid grid-cols-2 gap-0 divide-x divide-y divide-border md:grid-cols-3">
              {teamMembers.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-3">
                  <div className="relative">
                    <div className="flex size-9 items-center justify-center rounded-full text-xs font-semibold text-background" style={{ backgroundColor: m.avatarColor }}>{m.initials}</div>
                    <span className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-card ${m.online ? "bg-success" : "bg-muted"}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-medium">{m.name}</div>
                    <div className="truncate text-[10px] text-muted-foreground">{m.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div className="border-b border-border p-4"><SectionHeader title="Documents" subtitle="Drawings, datasheets, MOMs" /></div>
            <ul className="divide-y divide-border">
              {[
                { name: "Line 4 P&ID rev C.pdf", size: "2.4 MB", who: "Priya S.", when: "2h ago", icon: FileText },
                { name: "PLC I/O tag list.xlsx", size: "184 KB", who: "Sofia R.", when: "5h ago", icon: FileText },
                { name: "SCADA overview mock.png", size: "1.1 MB", who: "Kenji T.", when: "1d ago", icon: Paperclip },
                { name: "Safety validation plan.docx", size: "220 KB", who: "Nadia H.", when: "2d ago", icon: FileText },
                { name: "MOM — Kickoff.md", size: "12 KB", who: "AI", when: "3d ago", icon: Sparkles },
              ].map((d, i) => {
                const Icon = d.icon;
                return (
                  <li key={i} className="flex items-center gap-3 p-3 text-xs hover:bg-accent/30">
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{d.name}</div>
                      <div className="text-[10px] text-muted-foreground">{d.size} · {d.who} · {d.when}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function MetricCard({ label, value, sub, tone, icon, children }: { label: string; value: string | number; sub?: string; tone?: "success" | "warning" | "destructive" | "primary"; icon?: React.ReactNode; children?: React.ReactNode }) {
  const toneClass = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}<span>{label}</span></div>
      <div className={`mt-2 font-mono text-2xl font-semibold ${toneClass}`}>{value}</div>
      {sub && <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>}
      {children}
    </Card>
  );
}
