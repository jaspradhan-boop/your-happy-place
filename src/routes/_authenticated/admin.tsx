import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui-bits";
import { Loader2, ShieldCheck, Check, X, Trash2, LogOut, UserCog } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — IntelliTeam AI" },
      { name: "description", content: "Approve members, manage roles, and moderate all project entries." },
    ],
  }),
  beforeLoad: ({ context }) => {
    if (!context.isAdmin) throw redirect({ to: "/entries" });
  },
  component: AdminPage,
});

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

type UserRole = { user_id: string; role: "admin" | "member" };

function AdminPage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "all">("pending");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [{ data: p, error: pe }, { data: r, error: re }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    if (pe) toast.error(pe.message);
    if (re) toast.error(re.message);
    setProfiles((p as Profile[]) ?? []);
    setRoles((r as UserRole[]) ?? []);
    setLoading(false);
  }

  async function setStatus(id: string, status: "approved" | "rejected" | "pending") {
    const update = status === "approved"
      ? { status, approved_at: new Date().toISOString(), approved_by: user.id }
      : { status, approved_at: null, approved_by: null };
    const { error } = await supabase.from("profiles").update(update).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`User ${status}`);
    load();
  }

  async function toggleAdmin(userId: string, makeAdmin: boolean) {
    if (makeAdmin) {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
      if (error) return toast.error(error.message);
      toast.success("Granted admin");
    } else {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
      if (error) return toast.error(error.message);
      toast.success("Removed admin");
    }
    load();
  }

  async function deleteProfile(id: string) {
    if (id === user.id) return toast.error("You cannot delete your own account here.");
    if (!confirm("Delete this user's profile, roles, and all their entries?")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Profile deleted (auth user still exists; ask support to fully purge)");
    load();
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  const adminIds = new Set(roles.filter((r) => r.role === "admin").map((r) => r.user_id));
  const filtered = tab === "pending" ? profiles.filter((p) => p.status === "pending") : profiles;

  return (
    <AppShell>
      <div className="mx-auto max-w-[1200px] p-6">
        <div className="flex flex-wrap items-end justify-between gap-4 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">Admin Console</h1>
              <span className="inline-flex items-center gap-1 rounded bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                <ShieldCheck className="size-3" /> Admin
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Approve or reject signups, grant admin, and manage members.
            </p>
          </div>
          <button onClick={handleSignOut} className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs hover:bg-accent">
            <LogOut className="size-3.5" /> Sign out
          </button>
        </div>

        <div className="mb-4 flex gap-1 rounded-md border border-border bg-card p-1 text-xs w-fit">
          <button onClick={() => setTab("pending")} className={`rounded px-3 py-1.5 ${tab === "pending" ? "bg-accent text-foreground" : "text-muted-foreground"}`}>
            Pending approvals ({profiles.filter(p=>p.status==="pending").length})
          </button>
          <button onClick={() => setTab("all")} className={`rounded px-3 py-1.5 ${tab === "all" ? "bg-accent text-foreground" : "text-muted-foreground"}`}>
            All members ({profiles.length})
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground"><Loader2 className="mr-2 size-4 animate-spin" /> Loading…</div>
        ) : filtered.length === 0 ? (
          <Card className="py-12 text-center text-sm text-muted-foreground">
            {tab === "pending" ? "No pending approvals." : "No members yet."}
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-background/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-medium">User</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Role</th>
                  <th className="px-4 py-2 font-medium">Joined</th>
                  <th className="px-4 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const isAdmin = adminIds.has(p.id);
                  const isSelf = p.id === user.id;
                  return (
                    <tr key={p.id} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3">
                        <div className="font-medium">{p.full_name ?? p.email ?? p.id.slice(0, 8)}</div>
                        <div className="text-[11px] text-muted-foreground">{p.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                          p.status === "approved" ? "bg-success/15 text-success" :
                          p.status === "pending" ? "bg-warning/15 text-warning" :
                          "bg-destructive/15 text-destructive"
                        }`}>{p.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                          isAdmin ? "bg-primary/15 text-primary" : "bg-accent text-muted-foreground"
                        }`}>
                          {isAdmin && <ShieldCheck className="size-3" />}
                          {isAdmin ? "admin" : "member"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {p.status !== "approved" && (
                            <button onClick={() => setStatus(p.id, "approved")}
                              className="flex items-center gap-1 rounded bg-success/15 px-2 py-1 text-[11px] font-medium text-success hover:bg-success/25">
                              <Check className="size-3" /> Approve
                            </button>
                          )}
                          {p.status !== "rejected" && !isSelf && (
                            <button onClick={() => setStatus(p.id, "rejected")}
                              className="flex items-center gap-1 rounded bg-destructive/15 px-2 py-1 text-[11px] font-medium text-destructive hover:bg-destructive/25">
                              <X className="size-3" /> Reject
                            </button>
                          )}
                          {!isSelf && (
                            <button onClick={() => toggleAdmin(p.id, !isAdmin)}
                              className="flex items-center gap-1 rounded bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/20">
                              <UserCog className="size-3" /> {isAdmin ? "Revoke admin" : "Make admin"}
                            </button>
                          )}
                          {!isSelf && (
                            <button onClick={() => deleteProfile(p.id)}
                              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-destructive">
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
