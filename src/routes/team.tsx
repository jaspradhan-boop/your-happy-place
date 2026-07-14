import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, Progress, SectionHeader } from "@/components/ui-bits";
import { members, tasks } from "@/lib/mock-data";
import { Mail, MessageSquare, Phone, Search, UserPlus } from "lucide-react";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team — IntelliTeam AI" },
      { name: "description", content: "Team directory with roles, availability, workload, and AI-driven productivity insights." },
    ],
  }),
  component: Team,
});

function Team() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] p-6">
        <div className="flex flex-wrap items-end justify-between gap-4 pb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
            <p className="mt-1 text-sm text-muted-foreground">{members.length} members · {members.filter(m => m.online).length} online now</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5">
              <Search className="size-3.5 text-muted-foreground" />
              <input placeholder="Search by name, role, or skill" className="w-64 bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none" />
            </div>
            <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"><UserPlus className="size-3.5" />Invite</button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {members.map(m => {
            const openTasks = tasks.filter(t => t.assigneeId === m.id && t.status !== "done").length;
            const load = Math.min(100, 40 + openTasks * 13);
            return (
              <Card key={m.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="flex size-12 items-center justify-center rounded-full text-sm font-semibold text-background" style={{ backgroundColor: m.avatarColor }}>{m.initials}</div>
                    <span className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full ring-2 ring-card ${m.online ? "bg-success" : "bg-muted"}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{m.name}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{m.role}</div>
                    <div className="mt-0.5 truncate text-[10px] text-muted-foreground">{m.email}</div>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Workload</span>
                    <span className="font-mono">{openTasks} open · {load}%</span>
                  </div>
                  <Progress value={load} tone={load > 85 ? "warning" : "primary"} />
                </div>

                <div className="mt-3 grid grid-cols-3 gap-1 text-center text-[10px]">
                  <div className="rounded bg-muted p-1.5"><div className="text-muted-foreground">Prod.</div><div className="mt-0.5 font-mono font-semibold text-success">{80 + (m.id.charCodeAt(1) % 15)}</div></div>
                  <div className="rounded bg-muted p-1.5"><div className="text-muted-foreground">Focus</div><div className="mt-0.5 font-mono font-semibold">{60 + (m.id.charCodeAt(1) % 25)}%</div></div>
                  <div className="rounded bg-muted p-1.5"><div className="text-muted-foreground">On-time</div><div className="mt-0.5 font-mono font-semibold">{88 + (m.id.charCodeAt(1) % 10)}%</div></div>
                </div>

                <div className="mt-3 flex items-center justify-end gap-1 text-muted-foreground">
                  <button className="rounded border border-border bg-background p-1.5 hover:text-foreground"><MessageSquare className="size-3.5" /></button>
                  <button className="rounded border border-border bg-background p-1.5 hover:text-foreground"><Mail className="size-3.5" /></button>
                  <button className="rounded border border-border bg-background p-1.5 hover:text-foreground"><Phone className="size-3.5" /></button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
