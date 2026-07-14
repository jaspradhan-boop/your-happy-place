import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Card, Progress } from "@/components/ui-bits";
import { Mail, Search, UserPlus, Trash2, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deleteUserCompletely } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/team")({
  head: () => ({
    meta: [
      { title: "Team — IntelliTeam AI" },
      { name: "description", content: "Team directory with roles, availability, and admin controls." },
    ],
  }),
  component: Team,
});

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#0ea5e9", "#a855f7", "#14b8a6", "#ef4444"];
function colorFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return COLORS[Math.abs(h) % COLORS.length];
}
function initialsOf(p: Profile) {
  const name = p.full_name ?? p.email ?? "?";
  return name.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase() ?? "").join("") || "?";
}

function Team() {
  const { user, isAdmin } = Route.useRouteContext();
  const deleteUserFn = useServerFn(deleteUserCompletely);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [adminIds, setAdminIds] = useState<Set<string>>(new Set());
  const [entryCounts, setEntryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [{ data: p }, { data: r }, { data: e }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("project_entries").select("user_id, status"),
    ]);
    setProfiles((p as Profile[]) ?? []);
    setAdminIds(new Set(((r ?? []) as { user_id: string; role: string }[]).filter((x) => x.role === "admin").map((x) => x.user_id)));
    const counts: Record<string, number> = {};
    ((e ?? []) as { user_id: string; status: string }[]).forEach((x) => {
      if (x.status !== "completed" && x.status !== "cancelled") counts[x.user_id] = (counts[x.user_id] ?? 0) + 1;
    });
    setEntryCounts(counts);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (id === user.id) return toast.error("You cannot delete your own account.");
    if (!confirm("Permanently delete this team member and all their entries?")) return;
    try {
      await deleteUserFn({ data: { userId: id } });
      toast.success("Team member deleted");
      load();
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete");
    }
  }

  const filtered = profiles.filter((p) => {
    if (!q) return true;
    const hay = `${p.full_name ?? ""} ${p.email ?? ""}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] p-4 sm:p-6">
        <div className="flex flex-col gap-3 pb-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4 sm:pb-6">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Team</h1>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              {profiles.length} member{profiles.length === 1 ? "" : "s"} · {profiles.filter((p) => p.status === "approved").length} approved
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 sm:flex-none">
              <Search className="size-3.5 shrink-0 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name or email"
                className="min-w-0 flex-1 bg-transparent text-xs placeholder:text-muted-foreground focus:outline-none sm:w-64"
              />
            </div>
            {isAdmin && (
              <a href="/admin" className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                <UserPlus className="size-3.5" />Manage
              </a>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground"><Loader2 className="mr-2 size-4 animate-spin" /> Loading…</div>
        ) : filtered.length === 0 ? (
          <Card className="py-12 text-center text-sm text-muted-foreground">No members found.</Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((m) => {
              const openTasks = entryCounts[m.id] ?? 0;
              const load = Math.min(100, 20 + openTasks * 15);
              const isMemberAdmin = adminIds.has(m.id);
              const isSelf = m.id === user.id;
              return (
                <Card key={m.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-background" style={{ backgroundColor: colorFor(m.id) }}>
                      {initialsOf(m)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <div className="truncate text-sm font-semibold">{m.full_name ?? m.email ?? "Unnamed"}</div>
                        {isMemberAdmin && <ShieldCheck className="size-3.5 shrink-0 text-primary" />}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                        <Mail className="size-3 shrink-0" />
                        <span className="truncate">{m.email}</span>
                      </div>
                      <div className="mt-1">
                        <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider ${
                          m.status === "approved" ? "bg-success/15 text-success" :
                          m.status === "pending" ? "bg-warning/15 text-warning" :
                          "bg-destructive/15 text-destructive"
                        }`}>{m.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">Active entries</span>
                      <span className="font-mono">{openTasks} open</span>
                    </div>
                    <Progress value={load} tone={load > 85 ? "warning" : "primary"} />
                  </div>

                  {isAdmin && !isSelf && (
                    <div className="mt-3 flex items-center justify-end">
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="flex items-center gap-1 rounded border border-destructive/30 bg-destructive/10 px-2 py-1 text-[11px] font-medium text-destructive hover:bg-destructive/20"
                      >
                        <Trash2 className="size-3" /> Remove
                      </button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
