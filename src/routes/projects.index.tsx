import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, ProjectStatusBadge, PriorityBadge, Progress, AvatarStack, SectionHeader } from "@/components/ui-bits";
import { memberById, projects, tasks } from "@/lib/mock-data";
import { Filter, Plus, Search, Sparkles, LayoutGrid, List, Calendar } from "lucide-react";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — IntelliTeam AI" },
      { name: "description", content: "All programs and projects with live status, AI forecasts, and team allocation." },
    ],
  }),
  component: ProjectsIndex,
});

function ProjectsIndex() {
  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const totalSpent = projects.reduce((s, p) => s + p.spent, 0);
  const openTasks = tasks.filter(t => t.status !== "done").length;

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] p-4 sm:p-6">
        <div className="flex flex-col gap-3 pb-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4 sm:pb-6">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Projects</h1>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              {projects.length} programs · {openTasks} open tasks · ${(totalSpent / 1e6).toFixed(2)}M of ${(totalBudget / 1e6).toFixed(2)}M
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1 text-muted-foreground">
              <button className="rounded bg-accent px-2 py-1 text-xs text-foreground"><LayoutGrid className="size-3.5" /></button>
              <button className="px-2 py-1 text-xs hover:text-foreground"><List className="size-3.5" /></button>
              <button className="px-2 py-1 text-xs hover:text-foreground"><Calendar className="size-3.5" /></button>
            </div>
            <button className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs hover:bg-accent"><Filter className="size-3.5" /><span className="hidden sm:inline">Filter</span></button>
            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 sm:flex-none"><Plus className="size-3.5" /><span className="hidden sm:inline">New project</span><span className="sm:hidden">New</span></button>
          </div>
        </div>

        <div className="mb-5 flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 sm:mb-6">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input placeholder="Search projects, tags, or ask AI…" className="min-w-0 flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none" />
          <div className="hidden shrink-0 items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary sm:flex"><Sparkles className="size-3" /> AI</div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">

          {projects.map((p) => {
            const projectTasks = tasks.filter(t => t.projectId === p.id);
            const done = projectTasks.filter(t => t.status === "done").length;
            const memberAvatars = p.memberIds.map(id => memberById(id));
            const healthTone = p.health >= 80 ? "success" : p.health >= 65 ? "primary" : p.health >= 50 ? "warning" : "destructive";
            return (
              <Link key={p.id} to="/projects/$projectId" params={{ projectId: p.id }}>
                <Card className="group flex h-full flex-col p-4 transition hover:border-primary/40 hover:shadow-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded bg-primary/10 font-mono text-[10px] font-semibold text-primary">{p.key}</div>
                      <div>
                        <div className="text-sm font-semibold leading-tight">{p.name}</div>
                        <div className="text-[11px] text-muted-foreground">{p.department}</div>
                      </div>
                    </div>
                    <ProjectStatusBadge status={p.status} />
                  </div>

                  <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{p.description}</p>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-mono">{p.progress}%</span>
                    </div>
                    <Progress value={p.progress} tone={healthTone} />
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 rounded-md border border-border bg-background/30 p-2 text-center">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Health</div>
                      <div className={`font-mono text-sm font-semibold ${p.health >= 75 ? "text-success" : p.health >= 55 ? "text-warning" : "text-destructive"}`}>{p.health}</div>
                    </div>
                    <div className="border-x border-border">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Risk</div>
                      <div className={`font-mono text-sm font-semibold ${p.risk <= 30 ? "text-success" : p.risk <= 55 ? "text-warning" : "text-destructive"}`}>{p.risk}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Tasks</div>
                      <div className="font-mono text-sm font-semibold">{done}/{projectTasks.length}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <AvatarStack items={memberAvatars.map(m => ({ initials: m.initials, color: m.avatarColor }))} />
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={p.priority} />
                      <span className="text-[11px] text-muted-foreground">Due {new Date(p.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-start gap-2 rounded-md border border-primary/20 bg-primary/5 p-2.5">
                    <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">AI forecast</div>
                      <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">{p.aiForecast.recommendation}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
