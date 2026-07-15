import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, FolderKanban, MessagesSquare, Sparkles, Users, BarChart3, Bell, Search, Command, Plus, Settings, CircleDot, ClipboardList, ShieldCheck, Menu, X, Wallet, LogOut } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/entries", label: "Entries", icon: ClipboardList },
  { to: "/budget", label: "Budget", icon: Wallet },
  { to: "/admin", label: "Admin", icon: ShieldCheck, adminOnly: true },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/chat", label: "Team Chat", icon: MessagesSquare },
  { to: "/assistant", label: "AI Assistant", icon: Sparkles },
  { to: "/team", label: "Team", icon: Users },
  { to: "/reports", label: "Reports", icon: BarChart3 },
] as const;

const DEFAULT_PINS: { key: string; name: string; id: string; color: string }[] = [];

const HIDDEN_NAV_KEY = "it_hidden_nav";
const HIDDEN_PINS_KEY = "it_hidden_pins";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState<{ name: string; email: string; initials: string } | null>(null);
  const [hiddenNav, setHiddenNav] = useState<string[]>([]);
  const [hiddenPins, setHiddenPins] = useState<string[]>([]);

  useEffect(() => {
    try {
      setHiddenNav(JSON.parse(localStorage.getItem(HIDDEN_NAV_KEY) ?? "[]"));
      setHiddenPins(JSON.parse(localStorage.getItem(HIDDEN_PINS_KEY) ?? "[]"));
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const [{ data: roleData }, { data: prof }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", userData.user.id),
        supabase.from("profiles").select("full_name, email").eq("id", userData.user.id).maybeSingle(),
      ]);
      if (cancelled) return;
      setIsAdmin((roleData ?? []).some((r) => r.role === "admin"));
      const name = prof?.full_name || prof?.email || userData.user.email || "User";
      const email = prof?.email || userData.user.email || "";
      const initials = name.split(" ").map((s) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "U";
      setProfile({ name, email, initials });
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  function hideNav(to: string) {
    const next = [...new Set([...hiddenNav, to])];
    setHiddenNav(next);
    localStorage.setItem(HIDDEN_NAV_KEY, JSON.stringify(next));
  }
  function hidePin(id: string) {
    const next = [...new Set([...hiddenPins, id])];
    setHiddenPins(next);
    localStorage.setItem(HIDDEN_PINS_KEY, JSON.stringify(next));
  }
  function resetHidden() {
    setHiddenNav([]); setHiddenPins([]);
    localStorage.removeItem(HIDDEN_NAV_KEY);
    localStorage.removeItem(HIDDEN_PINS_KEY);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  const pins = DEFAULT_PINS.filter((p) => !hiddenPins.includes(p.id));

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
        <div className="flex items-center justify-between px-2 pb-1 pt-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Workspace</span>
          {isAdmin && (hiddenNav.length > 0 || hiddenPins.length > 0) && (
            <button onClick={resetHidden} className="text-[10px] text-primary hover:underline">Restore</button>
          )}
        </div>
        {DEFAULT_NAV.map((item) => {
          if ("adminOnly" in item && item.adminOnly && !isAdmin) return null;
          if (hiddenNav.includes(item.to)) return null;
          const active = "exact" in item && item.exact ? pathname === item.to : pathname.startsWith(item.to) && item.to !== "/";
          const isDash = item.to === "/" && pathname === "/";
          const isActive = active || isDash;
          const Icon = item.icon;
          return (
            <div key={item.to} className="group/nav flex items-center">
              <Link
                to={item.to}
                className={`flex flex-1 items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition ${
                  isActive ? "bg-sidebar-accent text-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-foreground"
                }`}
              >
                <Icon className={`size-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <span className="flex-1 truncate">{item.label}</span>
              </Link>
              {isAdmin && item.to !== "/admin" && item.to !== "/" && (
                <button
                  onClick={(e) => { e.preventDefault(); hideNav(item.to); }}
                  className="ml-1 rounded p-1 text-muted-foreground opacity-0 hover:bg-sidebar-accent hover:text-destructive group-hover/nav:opacity-100"
                  aria-label={`Hide ${item.label}`}
                  title="Hide from sidebar"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          );
        })}

        {pins.length > 0 && (
          <div className="px-2 pb-1 pt-5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Pinned projects</div>
        )}
        {pins.map((p) => (
          <div key={p.id} className="group/pin flex items-center">
            <Link
              to="/projects/$projectId"
              params={{ projectId: p.id }}
              className="flex flex-1 items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-foreground"
            >
              <span className="size-2 shrink-0 rounded-sm" style={{ backgroundColor: p.color }} />
              <span className="font-mono text-[11px] text-muted-foreground">{p.key}</span>
              <span className="truncate">{p.name}</span>
            </Link>
            {isAdmin && (
              <button
                onClick={(e) => { e.preventDefault(); hidePin(p.id); }}
                className="ml-1 rounded p-1 text-muted-foreground opacity-0 hover:bg-sidebar-accent hover:text-destructive group-hover/pin:opacity-100"
                aria-label={`Unpin ${p.name}`}
                title="Unpin"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
            {profile?.initials ?? "…"}
          </div>
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-xs font-semibold">{profile?.name ?? "Loading…"}</span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <CircleDot className="size-2 shrink-0 text-success" />
              {isAdmin ? "Administrator" : "Member"}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-destructive"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="size-3.5" />
          </button>
          <Link to="/admin" className="rounded p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground" title="Settings">
            <Settings className="size-3.5" />
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        {sidebar}
      </aside>

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
            <Link
              to="/entries"
              className="hidden items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground sm:flex"
              title="Create a new project entry"
            >
              <Plus className="size-3.5" /> New entry
            </Link>
            <button
              onClick={() => toast.info("You're all caught up — no new notifications.")}
              className="relative rounded-md border border-border bg-card p-1.5 text-muted-foreground hover:text-foreground"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
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
    "/budget": "Budget",
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
