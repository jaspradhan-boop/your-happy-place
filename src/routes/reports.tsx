import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Card, SectionHeader, Sparkline } from "@/components/ui-bits";
import { Download, FileText, FileSpreadsheet, Presentation, FileCode, Sparkles, TrendingUp, ShieldAlert, DollarSign, Clock, Users, Cpu, MessageSquare, Award, Trash2, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — IntelliTeam AI" },
      { name: "description", content: "AI-generated executive, project, forecast, risk, and productivity reports with export to PDF, Word, Excel." },
    ],
  }),
  component: Reports,
});

type CatalogItem = { id: string; icon: any; tone: string; title: string; meta: string; body: string; tags: string[] };
type RecentItem = { id: string; name: string; type: string; who: string; when: string };

const defaultCatalog: CatalogItem[] = [
  { id: "exec", icon: TrendingUp, tone: "text-primary", title: "Executive weekly digest", meta: "Auto-generated · every Monday 08:00", body: "KPI trends, portfolio health, risks, and AI recommendations for leadership.", tags: ["Weekly", "Executive"] },
  { id: "risk", icon: ShieldAlert, tone: "text-destructive", title: "Risk & mitigation report", meta: "Realtime · updated 12 min ago", body: "Top risks with predicted impact, RCA, and preventive actions.", tags: ["Risk", "Live"] },
  { id: "delay", icon: Clock, tone: "text-warning", title: "Delay & schedule forecast", meta: "Daily · every 06:00", body: "Predicted slippage per project with recovery plans.", tags: ["Forecast"] },
  { id: "budget", icon: DollarSign, tone: "text-success", title: "Budget & cost overrun", meta: "Weekly · every Friday", body: "Actuals vs plan with AI-detected cost anomalies.", tags: ["Finance"] },
  { id: "prod", icon: Users, tone: "text-info", title: "Productivity & utilization", meta: "Weekly · with burnout detection", body: "Team output, focus time, and burnout indicators.", tags: ["People"] },
  { id: "hw", icon: Cpu, tone: "text-primary", title: "Hardware knowledge base digest", meta: "Monthly · datasheet updates", body: "Component obsolescence alerts and approved alternates.", tags: ["Engineering"] },
  { id: "comm", icon: MessageSquare, tone: "text-muted-foreground", title: "Communication insights", meta: "Weekly · thread + meeting", body: "Meeting effectiveness, decision velocity, unresolved threads.", tags: ["Collab"] },
  { id: "qual", icon: Award, tone: "text-success", title: "Quality & compliance", meta: "Monthly · audit-ready", body: "ISO 27001 / GDPR posture with corrective actions.", tags: ["Compliance"] },
];

const defaultRecent: RecentItem[] = [];


const productivityTrend = [62, 68, 71, 70, 74, 79, 82, 85, 84, 87, 88, 87];
const budgetTrend = [12, 18, 22, 28, 30, 35, 44, 50, 58, 63, 68, 72];
const throughputTrend = [12, 14, 13, 18, 22, 21, 24, 27, 25, 29, 31, 33];

const CATALOG_KEY = "reports.catalog.hidden";
const RECENT_KEY = "reports.recent.hidden";

function Reports() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [hiddenCatalog, setHiddenCatalog] = useState<string[]>([]);
  const [hiddenRecent, setHiddenRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      setHiddenCatalog(JSON.parse(localStorage.getItem(CATALOG_KEY) || "[]"));
      setHiddenRecent(JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"));
    } catch {}
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      setIsAdmin((data ?? []).some((r: any) => r.role === "admin"));
    })();
  }, []);

  function persistCatalog(next: string[]) {
    setHiddenCatalog(next);
    localStorage.setItem(CATALOG_KEY, JSON.stringify(next));
  }
  function persistRecent(next: string[]) {
    setHiddenRecent(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  }

  function deleteCatalog(id: string) {
    if (!confirm("Delete this report template?")) return;
    persistCatalog([...hiddenCatalog, id]);
    toast.success("Report template removed");
  }
  function deleteRecent(id: string) {
    if (!confirm("Delete this generated report?")) return;
    persistRecent([...hiddenRecent, id]);
    toast.success("Report deleted");
  }
  function resetAll() {
    if (!confirm("Clear ALL reports and charts on this page? This removes every template and recently-generated report.")) return;
    const allCat = defaultCatalog.map(c => c.id);
    const allRec = defaultRecent.map(r => r.id);
    persistCatalog(allCat);
    persistRecent(allRec);
    toast.success("All reports cleared");
  }
  function restoreAll() {
    persistCatalog([]);
    persistRecent([]);
    toast.success("Reports restored");
  }

  const catalog = defaultCatalog.filter(c => !hiddenCatalog.includes(c.id));
  const recent = defaultRecent.filter(r => !hiddenRecent.includes(r.id));
  const anyHidden = hiddenCatalog.length > 0 || hiddenRecent.length > 0;

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] p-4 sm:p-6">
        <div className="flex flex-col gap-3 pb-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4 sm:pb-6">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Reports & Analytics</h1>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">AI-generated, audit-ready reports. Export to PDF, Word, Excel, PowerPoint, or CSV.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start">
            {isAdmin && (
              <>
                {anyHidden && (
                  <button onClick={restoreAll} className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs hover:bg-accent">
                    <RotateCcw className="size-3.5" /> Restore
                  </button>
                )}
                <button onClick={resetAll} className="flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20">
                  <Trash2 className="size-3.5" /> Clear all
                </button>
              </>
            )}
            <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs text-primary">
              <Sparkles className="size-3.5" /> {recent.length} reports generated this month
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <AnalyticsCard title="Productivity" value="87%" delta="+4.2%" values={productivityTrend} tone="primary" />
          <AnalyticsCard title="Budget burn" value="72%" delta="of plan" values={budgetTrend} tone="warning" />
          <AnalyticsCard title="Throughput" value="33/wk" delta="+8" values={throughputTrend} tone="success" />
        </div>

        <div className="mt-6">
          <SectionHeader title="Report library" subtitle="Ready-to-generate templates powered by IntelliTeam AI" />
          {catalog.length === 0 ? (
            <Card className="mt-4 py-12 text-center text-sm text-muted-foreground">No report templates.</Card>
          ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {catalog.map((r) => {
              const Icon = r.icon;
              return (
                <Card key={r.id} className="flex flex-col p-4">
                  <div className="flex items-start justify-between">
                    <div className={`flex size-9 items-center justify-center rounded-md bg-muted ${r.tone}`}><Icon className="size-4" /></div>
                    <div className="flex gap-1 text-muted-foreground">
                      <button className="rounded p-1 hover:bg-accent hover:text-foreground" title="PDF"><FileText className="size-3.5" /></button>
                      <button className="rounded p-1 hover:bg-accent hover:text-foreground" title="Excel"><FileSpreadsheet className="size-3.5" /></button>
                      <button className="rounded p-1 hover:bg-accent hover:text-foreground" title="PPT"><Presentation className="size-3.5" /></button>
                      <button className="rounded p-1 hover:bg-accent hover:text-foreground" title="Word"><FileCode className="size-3.5" /></button>
                      {isAdmin && (
                        <button onClick={() => deleteCatalog(r.id)} className="rounded p-1 hover:bg-accent hover:text-destructive" title="Delete">
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 text-sm font-semibold">{r.title}</div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground">{r.meta}</div>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">{r.body}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {r.tags.map(t => <span key={t} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{t}</span>)}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"><Sparkles className="size-3" /> Generate</button>
                    <button className="flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs hover:bg-accent"><Download className="size-3" /></button>
                  </div>
                </Card>
              );
            })}
          </div>
          )}
        </div>

        <div className="mt-8">
          <SectionHeader title="Recently generated" />
          <Card className="mt-3 overflow-hidden">
            {recent.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">No recently generated reports.</div>
            ) : (
            <>
            <div className="hidden grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-b border-border bg-muted/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid">
              <span>Report</span><span>Type</span><span>Author</span><span>Generated</span><span></span>
            </div>
            {recent.map((r) => (
              <div key={r.id} className="border-b border-border px-3 py-2.5 text-xs last:border-0 sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-center sm:gap-4 sm:px-4">
                <div className="flex items-center gap-2"><FileText className="size-3.5 shrink-0 text-primary" /><span className="truncate font-medium">{r.name}</span></div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground sm:mt-0 sm:contents">
                  <span className="rounded bg-muted px-1.5 py-px text-[10px]">{r.type}</span>
                  <span className="text-[10px] sm:text-xs">{r.who}</span>
                  <span className="text-[10px] sm:text-xs">{r.when}</span>
                  <div className="ml-auto flex items-center gap-1 sm:ml-0">
                    <button className="rounded p-1 hover:bg-accent hover:text-foreground"><Download className="size-3.5" /></button>
                    {isAdmin && (
                      <button onClick={() => deleteRecent(r.id)} className="rounded p-1 hover:bg-accent hover:text-destructive" title="Delete">
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            </>
            )}
          </Card>
        </div>

      </div>
    </AppShell>
  );
}

function AnalyticsCard({ title, value, delta, values, tone }: { title: string; value: string; delta: string; values: number[]; tone: "primary" | "success" | "warning" }) {
  const toneClass = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-primary";
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">{title}</div>
        <span className={`text-[10px] font-semibold ${toneClass}`}>{delta}</span>
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="font-mono text-2xl font-semibold">{value}</div>
        <div className={`h-12 w-32 ${toneClass}`}><Sparkline values={values} height={48} /></div>
      </div>
    </Card>
  );
}
