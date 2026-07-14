import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, SectionHeader, Sparkline } from "@/components/ui-bits";
import { Download, FileText, FileSpreadsheet, Presentation, FileCode, Sparkles, TrendingUp, ShieldAlert, DollarSign, Clock, Users, Cpu, MessageSquare, Award } from "lucide-react";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — IntelliTeam AI" },
      { name: "description", content: "AI-generated executive, project, forecast, risk, and productivity reports with export to PDF, Word, Excel." },
    ],
  }),
  component: Reports,
});

const reportCatalog = [
  { icon: TrendingUp, tone: "text-primary", title: "Executive weekly digest", meta: "Auto-generated · every Monday 08:00", body: "KPI trends, portfolio health, risks, and AI recommendations for leadership.", tags: ["Weekly", "Executive"] },
  { icon: ShieldAlert, tone: "text-destructive", title: "Risk & mitigation report", meta: "Realtime · updated 12 min ago", body: "Top risks with predicted impact, RCA, and preventive actions.", tags: ["Risk", "Live"] },
  { icon: Clock, tone: "text-warning", title: "Delay & schedule forecast", meta: "Daily · every 06:00", body: "Predicted slippage per project with recovery plans.", tags: ["Forecast"] },
  { icon: DollarSign, tone: "text-success", title: "Budget & cost overrun", meta: "Weekly · every Friday", body: "Actuals vs plan with AI-detected cost anomalies.", tags: ["Finance"] },
  { icon: Users, tone: "text-info", title: "Productivity & utilization", meta: "Weekly · with burnout detection", body: "Team output, focus time, and burnout indicators.", tags: ["People"] },
  { icon: Cpu, tone: "text-primary", title: "Hardware knowledge base digest", meta: "Monthly · datasheet updates", body: "Component obsolescence alerts and approved alternates.", tags: ["Engineering"] },
  { icon: MessageSquare, tone: "text-muted-foreground", title: "Communication insights", meta: "Weekly · thread + meeting", body: "Meeting effectiveness, decision velocity, unresolved threads.", tags: ["Collab"] },
  { icon: Award, tone: "text-success", title: "Quality & compliance", meta: "Monthly · audit-ready", body: "ISO 27001 / GDPR posture with corrective actions.", tags: ["Compliance"] },
];

const productivityTrend = [62, 68, 71, 70, 74, 79, 82, 85, 84, 87, 88, 87];
const budgetTrend = [12, 18, 22, 28, 30, 35, 44, 50, 58, 63, 68, 72];
const throughputTrend = [12, 14, 13, 18, 22, 21, 24, 27, 25, 29, 31, 33];

function Reports() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] p-4 sm:p-6">
        <div className="flex flex-col gap-3 pb-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4 sm:pb-6">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Reports & Analytics</h1>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">AI-generated, audit-ready reports. Export to PDF, Word, Excel, PowerPoint, or CSV.</p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs text-primary">
            <Sparkles className="size-3.5" /> 41 reports generated this month
          </div>
        </div>

        {/* Analytics summary */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <AnalyticsCard title="Productivity" value="87%" delta="+4.2%" values={productivityTrend} tone="primary" />
          <AnalyticsCard title="Budget burn" value="72%" delta="of plan" values={budgetTrend} tone="warning" />
          <AnalyticsCard title="Throughput" value="33/wk" delta="+8" values={throughputTrend} tone="success" />
        </div>


        {/* Report catalog */}
        <div className="mt-6">
          <SectionHeader title="Report library" subtitle="Ready-to-generate templates powered by IntelliTeam AI" />
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reportCatalog.map((r) => {
              const Icon = r.icon;
              return (
                <Card key={r.title} className="flex flex-col p-4">
                  <div className="flex items-start justify-between">
                    <div className={`flex size-9 items-center justify-center rounded-md bg-muted ${r.tone}`}><Icon className="size-4" /></div>
                    <div className="flex gap-1 text-muted-foreground">
                      <button className="rounded p-1 hover:bg-accent hover:text-foreground" title="PDF"><FileText className="size-3.5" /></button>
                      <button className="rounded p-1 hover:bg-accent hover:text-foreground" title="Excel"><FileSpreadsheet className="size-3.5" /></button>
                      <button className="rounded p-1 hover:bg-accent hover:text-foreground" title="PPT"><Presentation className="size-3.5" /></button>
                      <button className="rounded p-1 hover:bg-accent hover:text-foreground" title="Word"><FileCode className="size-3.5" /></button>
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
        </div>

        {/* Recent */}
        <div className="mt-8">
          <SectionHeader title="Recently generated" />
          <Card className="mt-3 overflow-hidden">
            <div className="hidden grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 border-b border-border bg-muted/40 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:grid">
              <span>Report</span><span>Type</span><span>Author</span><span>Generated</span><span></span>
            </div>
            {[
              { name: "Q2 2026 Executive Summary", type: "Executive", who: "AI", when: "2h ago" },
              { name: "Helix SCADA — Risk Report", type: "Risk", who: "AI", when: "Yesterday" },
              { name: "Apex Robotics — Weekly Status", type: "Project", who: "Aarav Mehta", when: "2 days ago" },
              { name: "Team Productivity June", type: "People", who: "AI", when: "5 days ago" },
              { name: "Vendor Alternates — PMC71", type: "Engineering", who: "AI", when: "1 week ago" },
            ].map((r, i) => (
              <div key={i} className="border-b border-border px-3 py-2.5 text-xs last:border-0 sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-center sm:gap-4 sm:px-4">
                <div className="flex items-center gap-2"><FileText className="size-3.5 shrink-0 text-primary" /><span className="truncate font-medium">{r.name}</span></div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground sm:mt-0 sm:contents">
                  <span className="rounded bg-muted px-1.5 py-px text-[10px]">{r.type}</span>
                  <span className="text-[10px] sm:text-xs">{r.who}</span>
                  <span className="text-[10px] sm:text-xs">{r.when}</span>
                  <button className="ml-auto rounded p-1 hover:bg-accent hover:text-foreground sm:ml-0"><Download className="size-3.5" /></button>
                </div>
              </div>
            ))}
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
