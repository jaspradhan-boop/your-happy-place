import type { ReactNode } from "react";
import type { Priority, ProjectStatus, TaskStatus } from "@/lib/mock-data";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-border bg-card ${className}`}>{children}</div>;
}

export function Avatar({ initials, color, size = 28 }: { initials: string; color: string; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-background"
      style={{ width: size, height: size, backgroundColor: color, fontSize: Math.max(9, size / 2.6) }}
    >
      {initials}
    </div>
  );
}

export function AvatarStack({ items, max = 4 }: { items: { initials: string; color: string }[]; max?: number }) {
  const shown = items.slice(0, max);
  const rest = items.length - shown.length;
  return (
    <div className="flex -space-x-1.5">
      {shown.map((m, i) => (
        <div key={i} className="rounded-full ring-2 ring-card">
          <Avatar initials={m.initials} color={m.color} size={22} />
        </div>
      ))}
      {rest > 0 && (
        <div className="flex size-[22px] items-center justify-center rounded-full bg-muted text-[9px] font-semibold text-muted-foreground ring-2 ring-card">
          +{rest}
        </div>
      )}
    </div>
  );
}

const priorityStyle: Record<Priority, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-info/15 text-info",
  high: "bg-warning/15 text-warning",
  critical: "bg-destructive/15 text-destructive",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-px text-[10px] font-semibold uppercase tracking-wider ${priorityStyle[priority]}`}>
      {priority}
    </span>
  );
}

const projectStatusStyle: Record<ProjectStatus, { label: string; className: string; dot: string }> = {
  planning: { label: "Planning", className: "bg-info/10 text-info", dot: "bg-info" },
  active: { label: "Active", className: "bg-success/10 text-success", dot: "bg-success" },
  at_risk: { label: "At risk", className: "bg-destructive/15 text-destructive", dot: "bg-destructive" },
  on_hold: { label: "On hold", className: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  completed: { label: "Completed", className: "bg-primary/15 text-primary", dot: "bg-primary" },
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const s = projectStatusStyle[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-medium ${s.className}`}>
      <span className={`size-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

const taskStatusStyle: Record<TaskStatus, { label: string; color: string }> = {
  backlog: { label: "Backlog", color: "oklch(0.66 0.02 260)" },
  todo: { label: "Todo", color: "oklch(0.72 0.14 235)" },
  in_progress: { label: "In progress", color: "oklch(0.78 0.15 78)" },
  review: { label: "In review", color: "oklch(0.68 0.2 320)" },
  done: { label: "Done", color: "oklch(0.72 0.15 152)" },
};

export function TaskStatusChip({ status }: { status: TaskStatus }) {
  const s = taskStatusStyle[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-border bg-background/40 px-1.5 py-0.5 text-[10px] font-medium text-foreground">
      <span className="size-1.5 rounded-full" style={{ backgroundColor: s.color }} />
      {s.label}
    </span>
  );
}

export function taskStatusColor(status: TaskStatus) {
  return taskStatusStyle[status].color;
}

export function taskStatusLabel(status: TaskStatus) {
  return taskStatusStyle[status].label;
}

export function Progress({ value, className = "", tone = "primary" }: { value: number; className?: string; tone?: "primary" | "success" | "warning" | "destructive" }) {
  const bg = tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : tone === "destructive" ? "bg-destructive" : "bg-primary";
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-muted ${className}`}>
      <div className={`h-full rounded-full transition-all ${bg}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Sparkline({ values, className = "", height = 32 }: { values: number[]; className?: string; height?: number }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const w = 100;
  const h = height;
  const range = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} preserveAspectRatio="none">
      <polyline fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

export function StatTile({
  label, value, hint, trend, spark, icon,
}: {
  label: string; value: string | number; hint?: string;
  trend?: { dir: "up" | "down"; text: string }; spark?: number[]; icon?: ReactNode;
}) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
        {trend && (
          <span className={`text-[10px] font-semibold ${trend.dir === "up" ? "text-success" : "text-destructive"}`}>
            {trend.dir === "up" ? "▲" : "▼"} {trend.text}
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="font-mono text-2xl font-semibold tracking-tight">{value}</div>
          {hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>}
        </div>
        {spark && <div className="w-24 text-primary"><Sparkline values={spark} /></div>}
      </div>
    </Card>
  );
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export const TASK_STATUSES: TaskStatus[] = ["backlog", "todo", "in_progress", "review", "done"];
