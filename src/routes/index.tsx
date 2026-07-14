import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, StatTile, SectionHeader, Progress, ProjectStatusBadge, AvatarStack, Sparkline, PriorityBadge } from "@/components/ui-bits";
import { activity, kpis, members, memberById, projects, tasks } from "@/lib/mock-data";
import { Activity, AlertTriangle, Bot, Calendar, CheckCircle2, Clock, Sparkles, TrendingUp, Users, Zap, ArrowRight, FileText, MessageSquare, ShieldAlert, UserCheck, GitCommit } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — IntelliTeam AI" },
      { name: "description", content: "Real-time overview of projects, tasks, team health, and AI insights across your organization." },
    ],
  }),
  component: Dashboard,
});

const productivityTrend = [62, 68, 71, 70, 74, 79, 82, 85, 84, 87];
const riskTrend = [22, 24, 28, 30, 34, 36, 38, 41, 40, 38];
const throughputTrend = [12, 14, 13, 18, 22, 21, 24, 27, 25, 29];

function Dashboard() {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const upcoming = tasks
    .filter((t) => t.status !== "done")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 6);

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] p-6">
        {/* Hero row */}
        <div className="flex flex-wrap items-end justify-between gap-4 pb-6">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{today}</div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Good morning, Aarav.</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              IntelliTeam AI has been busy. <span className="text-foreground">3 risks flagged</span>, <span className="text-foreground">7 tasks summarized</span>, and <span className="text-foreground">2 forecasts updated</span> overnight.
            </p>
          </div>
          <Link to="/assistant" className="group flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/15">
            <Sparkles className="size-3.5" />
            Ask AI about today
            <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile label="Productivity score" value={`${kpis.productivity}%`} hint="Team average, last 30 days" trend={{ dir: "up", text: "4.2%" }} spark={productivityTrend} icon={<TrendingUp className="size-3.5" />} />
          <StatTile label="On-time delivery" value={`${kpis.onTimeDelivery}%`} hint="Rolling 90 days" trend={{ dir: "up", text: "1.8%" }} spark={throughputTrend} icon={<CheckCircle2 className="size-3.5" />} />
          <StatTile label="Portfolio risk index" value={kpis.atRiskProjects} hint={`${kpis.activeProjects} active projects`} trend={{ dir: "down", text: "1 resolved" }} spark={riskTrend} icon={<AlertTriangle className="size-3.5" />} />
          <StatTile label="AI actions today" value={kpis.aiActionsToday} hint="Drafts, summaries, forecasts" trend={{ dir: "up", text: "12" }} spark={[8, 12, 15, 22, 28, 34, 41]} icon={<Bot className="size-3.5" />} />
        </div>

        {/* Main grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Portfolio health */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border p-4">
              <SectionHeader title="Portfolio health" subtitle="Live status across all active programs" />
              <Link to="/projects" className="text-xs text-muted-foreground hover:text-foreground">View all →</Link>
            </div>
            <div className="divide-y divide-border">
              {projects.slice(0, 4).map((p) => {
                const projTasks = tasks.filter((t) => t.projectId === p.id);
                const memberAvatars = p.memberIds.map((id) => memberById(id));
                const healthTone = p.health >= 80 ? "success" : p.health >= 65 ? "primary" : p.health >= 50 ? "warning" : "destructive";
                return (
                  <Link key={p.id} to="/projects/$projectId" params={{ projectId: p.id }} className="flex items-center gap-4 p-4 transition hover:bg-accent/30">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-[11px] font-semibold text-primary">
                      {p.key}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{p.name}</span>
                        <ProjectStatusBadge status={p.status} />
                        <PriorityBadge priority={p.priority} />
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-[11px] text-muted-foreground">
                        <span>{p.department}</span>
                        <span>Due {new Date(p.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        <span>{projTasks.length} tasks</span>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex-1"><Progress value={p.progress} tone={healthTone} /></div>
                        <span className="font-mono text-[11px] text-muted-foreground">{p.progress}%</span>
                      </div>
                    </div>
                    <div className="hidden shrink-0 sm:block">
                      <AvatarStack items={memberAvatars.map((m) => ({ initials: m.initials, color: m.avatarColor }))} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>

          {/* AI insights */}
          <Card>
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <h2 className="text-sm font-semibold tracking-tight">AI insights</h2>
              </div>
              <span className="rounded bg-primary/15 px-1.5 py-px text-[10px] font-semibold text-primary">Live</span>
            </div>
            <ul className="divide-y divide-border">
              {[
                { icon: ShieldAlert, tone: "text-destructive", title: "Helix SCADA — sensor lead time risk", body: "Predicted 20-day slip. Suggest alternate: Endress+Hauser PMC71.", cta: "Open project" },
                { icon: Zap, tone: "text-warning", title: "Apex Robotics — commissioning path", body: "Add 1 contract PLC engineer to recover 5 days on critical path.", cta: "See forecast" },
                { icon: CheckCircle2, tone: "text-success", title: "Nova Packaging — reuse detected", body: "Vision FAT protocol from ZPH matches 82%. Auto-draft ready.", cta: "Review draft" },
                { icon: UserCheck, tone: "text-info", title: "Utilization anomaly — Kenji T.", body: "12% below capacity. Suggested reassignment: OPC UA sizing.", cta: "Reassign" },
              ].map((i, idx) => {
                const Icon = i.icon;
                return (
                  <li key={idx} className="p-3">
                    <div className="flex items-start gap-2.5">
                      <div className={`mt-0.5 ${i.tone}`}><Icon className="size-4" /></div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium">{i.title}</div>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{i.body}</p>
                        <button className="mt-1.5 text-[11px] font-medium text-primary hover:underline">{i.cta} →</button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        {/* Second row */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Upcoming deadlines */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between border-b border-border p-4">
              <SectionHeader title="Upcoming deadlines" subtitle="Next 14 days across active projects" />
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="size-3.5" /> Sorted by due date
              </div>
            </div>
            <div className="divide-y divide-border">
              {upcoming.map((t) => {
                const p = projects.find((pr) => pr.id === t.projectId)!;
                const m = memberById(t.assigneeId);
                const daysLeft = Math.ceil((new Date(t.dueDate).getTime() - Date.now()) / 86400000);
                return (
                  <div key={t.id} className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-3 p-3 text-sm">
                    <div className="flex size-8 items-center justify-center rounded bg-primary/10 font-mono text-[10px] font-semibold text-primary">{p.key}</div>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{t.title}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{p.name} · {t.tags.join(" · ")}</div>
                    </div>
                    <PriorityBadge priority={t.priority} />
                    <div className="hidden items-center gap-1.5 text-[11px] text-muted-foreground sm:flex">
                      <div className="size-5 rounded-full" style={{ backgroundColor: m.avatarColor }} />
                      {m.name.split(" ")[0]}
                    </div>
                    <div className={`text-right font-mono text-[11px] ${daysLeft < 3 ? "text-destructive" : daysLeft < 7 ? "text-warning" : "text-muted-foreground"}`}>
                      {daysLeft <= 0 ? "Overdue" : `${daysLeft}d`}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Team pulse */}
          <Card>
            <div className="flex items-center justify-between border-b border-border p-4">
              <SectionHeader title="Team pulse" subtitle="Availability & workload" />
              <Users className="size-4 text-muted-foreground" />
            </div>
            <div className="divide-y divide-border">
              {members.slice(0, 6).map((m) => {
                const load = Math.floor(45 + Math.random() * 55);
                return (
                  <div key={m.id} className="flex items-center gap-3 p-3">
                    <div className="relative">
                      <div className="flex size-8 items-center justify-center rounded-full text-[11px] font-semibold text-background" style={{ backgroundColor: m.avatarColor }}>{m.initials}</div>
                      <span className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-card ${m.online ? "bg-success" : "bg-muted"}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium">{m.name}</div>
                      <div className="truncate text-[10px] text-muted-foreground">{m.role}</div>
                    </div>
                    <div className="w-16">
                      <Progress value={load} tone={load > 85 ? "warning" : "primary"} />
                    </div>
                    <span className="w-8 text-right font-mono text-[10px] text-muted-foreground">{load}%</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Third row */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Throughput chart */}
          <Card className="p-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold tracking-tight">Delivery throughput</h2>
                <p className="text-[11px] text-muted-foreground">Tasks completed per week · last 10 weeks</p>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <LegendDot color="oklch(0.72 0.16 265)" label="Completed" />
                <LegendDot color="oklch(0.78 0.15 78)" label="Started" />
              </div>
            </div>
            <div className="mt-4 h-40">
              <BarChart values={throughputTrend} secondary={productivityTrend.map(v => v/3)} />
            </div>
          </Card>

          {/* Activity feed */}
          <Card>
            <div className="flex items-center justify-between border-b border-border p-4">
              <SectionHeader title="Activity" subtitle="Realtime workspace events" />
              <Activity className="size-4 text-muted-foreground" />
            </div>
            <ul className="divide-y divide-border">
              {activity.map((a) => {
                const iconMap = { task: CheckCircle2, review: FileText, risk: ShieldAlert, file: GitCommit, approval: UserCheck, comment: MessageSquare };
                const Icon = iconMap[a.type];
                const tone = a.type === "risk" ? "text-destructive" : a.type === "approval" ? "text-success" : a.type === "task" ? "text-primary" : "text-muted-foreground";
                return (
                  <li key={a.id} className="flex items-start gap-2.5 p-3 text-xs">
                    <Icon className={`mt-0.5 size-3.5 ${tone}`} />
                    <div className="min-w-0 flex-1 leading-relaxed">
                      <span className="font-medium">{a.who}</span>{" "}
                      <span className="text-muted-foreground">{a.what}</span>{" "}
                      <span className="font-medium">{a.target}</span>
                      <div className="mt-0.5 text-[10px] text-muted-foreground">{a.when}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        {/* Calendar strip */}
        <div className="mt-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <SectionHeader title="This week" subtitle="Meetings, milestones, and check-ins" />
              <Calendar className="size-4 text-muted-foreground" />
            </div>
            <div className="mt-4 grid grid-cols-7 gap-2">
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d, i) => {
                const events = i === 0 ? [{ t: "APX standup", tone: "primary" }, { t: "Vendor call", tone: "info" }]
                  : i === 1 ? [{ t: "HVX risk review", tone: "destructive" }]
                  : i === 2 ? [{ t: "SCADA design review", tone: "primary" }, { t: "1:1 with Sofia", tone: "muted" }]
                  : i === 3 ? [{ t: "AI forecast digest", tone: "primary" }]
                  : i === 4 ? [{ t: "Sprint close", tone: "success" }, { t: "MOM review", tone: "muted" }]
                  : [];
                return (
                  <div key={d} className={`rounded-md border p-2 ${i === 0 ? "border-primary/40 bg-primary/5" : "border-border"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{d}</span>
                      <span className="font-mono text-xs text-muted-foreground">{14 + i}</span>
                    </div>
                    <div className="mt-2 space-y-1">
                      {events.map((e, ei) => (
                        <div key={ei} className={`truncate rounded px-1.5 py-0.5 text-[10px] ${
                          e.tone === "primary" ? "bg-primary/15 text-primary" :
                          e.tone === "destructive" ? "bg-destructive/15 text-destructive" :
                          e.tone === "success" ? "bg-success/15 text-success" :
                          e.tone === "info" ? "bg-info/15 text-info" :
                          "bg-muted text-muted-foreground"
                        }`}>{e.t}</div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-1.5 text-muted-foreground"><span className="size-2 rounded-sm" style={{ backgroundColor: color }} />{label}</span>;
}

function BarChart({ values, secondary }: { values: number[]; secondary: number[] }) {
  const max = Math.max(...values, ...secondary) * 1.1;
  return (
    <div className="flex h-full items-end gap-2">
      {values.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div className="flex h-full w-full items-end gap-0.5">
            <div className="flex-1 rounded-t bg-primary/80" style={{ height: `${(v / max) * 100}%` }} />
            <div className="flex-1 rounded-t bg-warning/70" style={{ height: `${(secondary[i] / max) * 100}%` }} />
          </div>
          <span className="text-[9px] text-muted-foreground">W{i + 1}</span>
        </div>
      ))}
    </div>
  );
}
