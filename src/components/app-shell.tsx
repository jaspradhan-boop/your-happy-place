import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, FolderKanban, MessagesSquare, Sparkles, Users, BarChart3, Bell, Search, Command, Plus, Settings, CircleDot, ClipboardList, ShieldCheck, Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/entries", label: "Entries", icon: ClipboardList },
  { to: "/admin", label: "Admin", icon: ShieldCheck, adminOnly: true },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/chat", label: "Team Chat", icon: MessagesSquare, badge: 18 },
  { to: "/assistant", label: "AI Assistant", icon: Sparkles },
  { to: "/team", label: "Team", icon: Users },
  { to: "/reports", label: "Reports", icon: BarChart3 },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", userData.user.id);
      if (!cancelled) setIsAdmin((data ?? []).some((r) => r.role === "admin"));
    })();
    return () => { cancelled = true; };
  }, []);

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const sidebar = (
    <>
      <div className="flex h-14 items-center gap-2 px-4">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
          <Sparkles className="size-4" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight">IntelliTeam</span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">AI · Enterprise</span>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="ml-auto rounded p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground lg:hidden"
          aria-label="Close menu"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="px-3">
        <button className="flex w-full items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent/40 px-2.5 py-1.5 text-xs text-muted-foreground transition hover:bg-sidebar-accent">
          <Search className="size-3.5" />
          <span className="flex-1 text-left">Search or ask AI…</span>
          <span className="hidden items-center gap-0.5 rounded border border-sidebar-border px-1 py-px text-[10px] text-muted-foreground/80 sm:flex">
            <Command className="size-2.5" />K
          </span>
        </button>
      </div>

      <nav className="mt-4 flex-1 space-y-0.5 overflow-y-auto px-2 scrollbar-thin">
        <div className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Workspace</div>
        {nav.map((item) => {
          if ("adminOnly" in item && item.adminOnly && !isAdmin) return null;
          const active = "exact" in item && item.exact ? pathname === item.to : pathname.startsWith(item.to) && item.to !== "/";
          const isDash = item.to === "/" && pathname === "/";
          const isActive = active || isDash;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition ${
                isActive ? "bg-sidebar-accent text-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-foreground"
              }`}
            >
              <Icon className={`size-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
              <span className="flex-1 truncate">{item.label}</span>
              {"badge" in item && item.badge ? (
                <span className="rounded bg-primary/15 px-1.5 py-px text-[10px] font-semibold text-primary">{item.badge}</span>
              ) : null}
            </Link>
          );
        })}

        <div className="px-2 pb-1 pt-5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Pinned projects</div>
        {[
          { key: "APX", name: "Apex Robotics", id: "p1", color: "oklch(0.72 0.16 265)" },
          { key: "HVX", name: "Helix SCADA", id: "p2", color: "oklch(0.62 0.22 22)" },
          { key: "NVA", name: "Nova Packaging", id: "p3", color: "oklch(0.72 0.15 152)" },
          { key: "ORN", name: "Orion Substation", id: "p4", color: "oklch(0.78 0.15 78)" },
        ].map((p) => (
          <Link
            key={p.id}
            to="/projects/$projectId"
            params={{ projectId: p.id }}
            className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-foreground"
          >
            <span className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: p.color }} />
            <span className="font-mono text-[11px] text-muted-foreground">{p.key}</span>
            <span className="truncate">{p.name}</span>
          </Link>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">AM</div>
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-xs font-semibold">Aarav Mehta</span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <CircleDot className="size-2 shrink-0 text-success" />
              Program Manager
            </span>
          </div>
          <button className="rounded p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground">
            <Settings className="size-3.5" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[78%] max-w-[280px] flex-col border-r border-sidebar-border bg-sidebar shadow-2xl">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              className="-ml-1 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Sparkles className="size-3.5" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-semibold tracking-tight">IntelliTeam</span>
            </div>
            <div className="hidden lg:block">
              <Breadcrumbs pathname={pathname} />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button className="hidden items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground sm:flex">
              <Plus className="size-3.5" /> New
            </button>
            <button className="relative rounded-md border border-border bg-card p-1.5 text-muted-foreground hover:text-foreground">
              <Bell className="size-4" />
              <span className="absolute right-1 top-1 size-1.5 rounded-full bg-primary" />
            </button>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-auto scrollbar-thin">{children}</main>
      </div>
    </div>
  );
}

function Breadcrumbs({ pathname }: { pathname: string }) {
  const map: Record<string, string> = {
    "/": "Dashboard",
    "/entries": "Entries",
    "/admin": "Admin",
    "/projects": "Projects",
    "/chat": "Team Chat",
    "/assistant": "AI Assistant",
    "/team": "Team",
    "/reports": "Reports",
  };
  const label = map[pathname] ?? (pathname.startsWith("/projects/") ? "Project" : "IntelliTeam AI");
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">IntelliTeam</span>
      <span className="text-muted-foreground/50">/</span>
      <span className="font-medium text-foreground">{label}</span>
    </div>
  );
}
