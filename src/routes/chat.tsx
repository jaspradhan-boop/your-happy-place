import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { channels, memberById, messages, members } from "@/lib/mock-data";
import { useState } from "react";
import { Hash, Search, Send, Sparkles, Plus, AtSign, Paperclip, Smile, Mic, Bot, Pin, Bell, Menu, X } from "lucide-react";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Team Chat — IntelliTeam AI" },
      { name: "description", content: "Realtime team chat with channels, DMs, AI assistant, and threaded discussions." },
    ],
  }),
  component: Chat,
});

function Chat() {
  const [activeId, setActiveId] = useState("c3");
  const [input, setInput] = useState("");
  const active = channels.find(c => c.id === activeId)!;
  const channelMessages = messages.filter(m => m.channelId === activeId);
  const projectChannels = channels.filter(c => c.type === "project" || c.type === "channel");
  const dms = channels.filter(c => c.type === "dm");

  return (
    <AppShell>
      <div className="flex h-full">
        {/* Channel list */}
        <div className="flex w-64 shrink-0 flex-col border-r border-border bg-card/30">
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="text-sm font-semibold">Conversations</h2>
            <button className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"><Plus className="size-3.5" /></button>
          </div>
          <div className="px-3 pb-2">
            <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5 text-xs text-muted-foreground">
              <Search className="size-3.5" /><input placeholder="Search" className="flex-1 bg-transparent placeholder:text-muted-foreground focus:outline-none" />
            </div>
          </div>
          <nav className="flex-1 space-y-0.5 overflow-auto px-2 pb-4 scrollbar-thin">
            <SectionLabel>Channels</SectionLabel>
            {projectChannels.map(c => (
              <ChannelRow key={c.id} channel={c} active={c.id === activeId} onClick={() => setActiveId(c.id)} />
            ))}
            <SectionLabel>Direct messages</SectionLabel>
            {dms.map(c => (
              <ChannelRow key={c.id} channel={c} active={c.id === activeId} onClick={() => setActiveId(c.id)} />
            ))}
            <SectionLabel>AI</SectionLabel>
            <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-accent hover:text-foreground">
              <Sparkles className="size-3.5 text-primary" /> <span className="flex-1 text-left">IntelliTeam AI</span>
            </button>
          </nav>
        </div>

        {/* Conversation */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-border px-6 py-3">
            <div className="flex items-center gap-2">
              {active.type === "dm" ? <AtSign className="size-4 text-muted-foreground" /> : active.type === "project" ? <Hash className="size-4 text-primary" /> : <Hash className="size-4 text-muted-foreground" />}
              <div>
                <div className="text-sm font-semibold">{active.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {active.type === "project" ? "Project channel · 6 members · pinned by 3" : active.type === "dm" ? "Direct message" : "8 members"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <button className="rounded p-1.5 hover:bg-accent hover:text-foreground"><Pin className="size-3.5" /></button>
              <button className="rounded p-1.5 hover:bg-accent hover:text-foreground"><Bell className="size-3.5" /></button>
              <button className="rounded p-1.5 hover:bg-accent hover:text-foreground"><Search className="size-3.5" /></button>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-auto scrollbar-thin p-6">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> Today <span className="h-px flex-1 bg-border" />
            </div>
            {channelMessages.map(m => {
              const author = memberById(m.authorId);
              return (
                <div key={m.id} className="group flex gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-background" style={{ backgroundColor: author.avatarColor }}>{author.initials}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold">{author.name}</span>
                      <span className="text-[10px] text-muted-foreground">{author.role}</span>
                      <span className="text-[10px] text-muted-foreground">{m.timestamp}</span>
                    </div>
                    <p className="mt-0.5 text-sm leading-relaxed">{m.body}</p>
                    {m.aiTagged && (
                      <div className="mt-1.5 inline-flex items-center gap-1 rounded border border-primary/30 bg-primary/5 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                        <Sparkles className="size-2.5" /> AI actioned
                      </div>
                    )}
                    {m.reactions && (
                      <div className="mt-1.5 flex gap-1">
                        {m.reactions.map((r, i) => (
                          <span key={i} className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-1.5 py-0.5 text-[10px]">
                            <span>{r.emoji}</span><span className="text-muted-foreground">{r.count}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* AI summary block */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
              <div className="flex items-center gap-2 text-xs">
                <Bot className="size-4 text-primary" />
                <span className="font-semibold text-primary">AI Summary of this conversation</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Team is aligned on FAT protocol reuse from ZPH (saves ~2 days). Panel wiring at station 3 blocked by cable trays — escalated to supply chain. Aarav requested an AI-drafted vendor email.
              </p>
              <div className="mt-2 flex gap-1.5">
                <button className="rounded bg-primary/15 px-2 py-1 text-[10px] font-medium text-primary hover:bg-primary/25">Generate action items</button>
                <button className="rounded border border-border bg-background px-2 py-1 text-[10px] font-medium hover:bg-accent">Draft vendor email</button>
                <button className="rounded border border-border bg-background px-2 py-1 text-[10px] font-medium hover:bg-accent">Create MOM</button>
              </div>
            </div>
          </div>

          <div className="border-t border-border p-4">
            <div className="rounded-lg border border-border bg-card focus-within:border-primary/50">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Message #${active.name} or type / for AI commands`}
                rows={2}
                className="w-full resize-none bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none"
              />
              <div className="flex items-center justify-between border-t border-border px-2 py-1.5">
                <div className="flex items-center gap-0.5 text-muted-foreground">
                  <button className="rounded p-1.5 hover:bg-accent hover:text-foreground"><Paperclip className="size-3.5" /></button>
                  <button className="rounded p-1.5 hover:bg-accent hover:text-foreground"><AtSign className="size-3.5" /></button>
                  <button className="rounded p-1.5 hover:bg-accent hover:text-foreground"><Smile className="size-3.5" /></button>
                  <button className="rounded p-1.5 hover:bg-accent hover:text-foreground"><Mic className="size-3.5" /></button>
                  <button className="flex items-center gap-1 rounded px-1.5 py-1 text-[10px] font-medium text-primary hover:bg-primary/10"><Sparkles className="size-3" /> AI</button>
                </div>
                <button className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                  Send <Send className="size-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — members */}
        <aside className="hidden w-60 shrink-0 flex-col border-l border-border bg-card/30 xl:flex">
          <div className="border-b border-border px-4 py-3">
            <div className="text-sm font-semibold">Members</div>
            <div className="text-[11px] text-muted-foreground">{members.length} in workspace</div>
          </div>
          <ul className="flex-1 overflow-auto scrollbar-thin">
            {members.map(m => (
              <li key={m.id} className="flex items-center gap-2.5 px-4 py-2 hover:bg-accent/40">
                <div className="relative">
                  <div className="flex size-7 items-center justify-center rounded-full text-[10px] font-semibold text-background" style={{ backgroundColor: m.avatarColor }}>{m.initials}</div>
                  <span className={`absolute -bottom-0.5 -right-0.5 size-2 rounded-full ring-2 ring-card ${m.online ? "bg-success" : "bg-muted"}`} />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium">{m.name}</div>
                  <div className="truncate text-[10px] text-muted-foreground">{m.role}</div>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </AppShell>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="px-2 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{children}</div>;
}

function ChannelRow({ channel, active, onClick }: { channel: typeof channels[number]; active: boolean; onClick: () => void }) {
  const Icon = channel.type === "dm" ? AtSign : channel.type === "project" ? Hash : Hash;
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition ${active ? "bg-accent text-foreground" : "text-sidebar-foreground/80 hover:bg-accent/60 hover:text-foreground"}`}
    >
      <Icon className={`size-3.5 ${active ? "text-primary" : "text-muted-foreground"}`} />
      <span className="flex-1 truncate text-left">{channel.name}</span>
      {channel.unread > 0 && <span className="rounded bg-primary/20 px-1.5 py-px text-[10px] font-semibold text-primary">{channel.unread}</span>}
    </button>
  );
}
