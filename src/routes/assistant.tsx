import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useEffect, useState } from "react";
import { Sparkles, Send, Mic, Paperclip, FileText, TrendingUp, Bot, Search, ShieldAlert, Users, Lightbulb, Zap, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";


export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — IntelliTeam AI" },
      { name: "description", content: "Natural language AI assistant for reports, forecasts, MOMs, risk analysis, and enterprise search." },
    ],
  }),
  component: Assistant,
});

type Msg = { role: "user" | "ai"; text: string; card?: React.ReactNode };

const suggestions = [
  { icon: TrendingUp, title: "Forecast portfolio delivery", body: "Predict completion & risks for all active projects this quarter." },
  { icon: FileText, title: "Draft weekly executive report", body: "Auto-generate with charts, KPIs, and root-cause analysis." },
  { icon: ShieldAlert, title: "Identify at-risk items", body: "Scan tasks & projects for schedule, budget, and supply risks." },
  { icon: Users, title: "Recommend resource plan", body: "Suggest reassignments to relieve burnout and hit deadlines." },
  { icon: Search, title: "Find hardware alternatives", body: "Search vendors & datasheets for an approved alternate part." },
  { icon: Lightbulb, title: "Summarize latest MOM", body: "Turn the last meeting into decisions, actions, owners, and dates." },
];

function Assistant() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [greeting, setGreeting] = useState("Hi — ready when you are. Try one of the shortcuts below or ask me anything.");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("full_name, email").eq("id", user.id).maybeSingle();
      const first = (profile?.full_name || profile?.email || "").split(/[@\s]/)[0];
      const name = first ? first.charAt(0).toUpperCase() + first.slice(1) : "there";
      setGreeting(`Hi ${name} — ready when you are. Try one of the shortcuts below or ask me anything.`);
    })();
  }, []);

  const displayed: Msg[] = messages.length === 0
    ? [{ role: "ai", text: greeting }]
    : messages;

  function send(q: string) {
    if (!q.trim()) return;
    setMessages(prev => [
      ...prev,
      { role: "user", text: q },
      { role: "ai", text: "Thanks — I'll get to work on that. Connect your project data and documents so I can ground responses in your workspace." },
    ]);
    setInput("");
  }


  return (
    <AppShell>
      <div className="mx-auto flex h-full max-w-5xl flex-col p-3 sm:p-6">
        <div className="flex flex-wrap items-center gap-3 pb-3 sm:pb-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-10">
            <Sparkles className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-semibold tracking-tight sm:text-xl">IntelliTeam AI Assistant</h1>
            <p className="text-[11px] text-muted-foreground sm:text-xs">Grounded in your projects, tasks, documents, and meetings.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[10px] font-medium text-success">
            <span className="size-1.5 rounded-full bg-success" /> <span className="hidden sm:inline">Connected · 128 sources indexed</span><span className="sm:hidden">Live</span>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-auto rounded-xl border border-border bg-card/40 p-3 scrollbar-thin sm:p-6">
          {displayed.map((m, i) => (
            <div key={i} className={`flex gap-2 sm:gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role === "ai" && (
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary"><Sparkles className="size-4" /></div>
              )}
              <div className={`max-w-[85%] space-y-2 sm:max-w-[75%] ${m.role === "user" ? "order-1" : ""}`}>
                <div className={`rounded-2xl px-3 py-2 text-sm sm:px-4 sm:py-2.5 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-background border border-border"}`}>
                  {m.text}
                </div>
                {m.card}
              </div>
              {m.role === "user" && (
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-foreground"><User className="size-4" /></div>
              )}
            </div>
          ))}


          {messages.length === 0 && (

            <div className="pt-4">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Try one of these</div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                {suggestions.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button key={s.title} onClick={() => send(s.title)} className="group flex flex-col gap-1 rounded-lg border border-border bg-background p-3 text-left transition hover:border-primary/40 hover:bg-accent/40">
                      <div className="flex items-center gap-2">
                        <Icon className="size-3.5 text-primary" />
                        <span className="text-xs font-semibold">{s.title}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">{s.body}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className="rounded-xl border border-border bg-card focus-within:border-primary/50">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              rows={2}
              placeholder="Ask anything — forecast a project, draft a status update, summarize a meeting, find an alternate part…"
              className="w-full resize-none bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none"
            />
            <div className="flex items-center justify-between border-t border-border px-3 py-2">
              <div className="flex items-center gap-1 text-muted-foreground">
                <button className="rounded p-1.5 hover:bg-accent hover:text-foreground"><Paperclip className="size-3.5" /></button>
                <button className="rounded p-1.5 hover:bg-accent hover:text-foreground"><Mic className="size-3.5" /></button>
                <button className="flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-[11px] hover:bg-accent"><Bot className="size-3" /> GPT-5 Enterprise</button>
                <button className="flex items-center gap-1 rounded border border-border bg-background px-2 py-1 text-[11px] hover:bg-accent"><Zap className="size-3" /> Grounded</button>
              </div>
              <button onClick={() => send(input)} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                Send <Send className="size-3" />
              </button>
            </div>
          </div>
          <div className="mt-2 text-center text-[10px] text-muted-foreground">
            Responses are grounded in your enterprise data. AI actions require role-based approval.
          </div>
        </div>
      </div>
    </AppShell>
  );
}



