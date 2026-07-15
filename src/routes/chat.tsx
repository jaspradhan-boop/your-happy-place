import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { channels as defaultChannels, members, messages as defaultMessages, type ChatChannel, type ChatMessage } from "@/lib/mock-data";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Hash, Search, Send, Sparkles, Plus, AtSign, Paperclip, Smile, Mic, Bot, Pin, Bell, Menu, X, Trash2, Users, User as UserIcon, Check } from "lucide-react";
import { toast } from "sonner";

const CHAT_CHANNELS_KEY = "it_chat_channels_v2";
const CHAT_MESSAGES_KEY = "it_chat_messages_v2";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Team Chat — IntelliTeam AI" },
      { name: "description", content: "Realtime team chat with channels, DMs, AI assistant, and threaded discussions." },
    ],
  }),
  component: Chat,
});

type NewChatMode = "dm" | "group" | "team";

function Chat() {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeId, setActiveId] = useState("");
  const [input, setInput] = useState("");
  const [convOpen, setConvOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState("u1");
  const [storageReady, setStorageReady] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);

  useEffect(() => {
    setChannels(readStored(CHAT_CHANNELS_KEY, defaultChannels));
    setMessages(readStored(CHAT_MESSAGES_KEY, defaultMessages));
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    localStorage.setItem(CHAT_CHANNELS_KEY, JSON.stringify(channels));
  }, [channels, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages));
  }, [messages, storageReady]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      if ((data ?? []).some((r) => r.role === "admin")) setIsAdmin(true);
    })();
  }, []);

  const active = channels.find(c => c.id === activeId) ?? channels[0];
  const channelMessages = messages.filter(m => m.channelId === active?.id);
  const projectChannels = channels.filter(c => c.type === "project" || c.type === "channel");
  const dms = channels.filter(c => c.type === "dm");

  function createConversation(payload: { mode: NewChatMode; name: string; memberIds: string[] }) {
    const channel: ChatChannel = {
      id: crypto.randomUUID(),
      name: payload.name,
      type: payload.mode === "dm" ? "dm" : "channel",
      unread: 0,
      memberIds: payload.mode === "team" ? members.map(m => m.id) : payload.memberIds,
    };
    setChannels((prev) => [channel, ...prev]);
    setActiveId(channel.id);
    setNewChatOpen(false);
    toast.success(payload.mode === "dm" ? "Direct message started" : payload.mode === "team" ? "Team channel created" : "Group chat created");
  }

  function deleteConversation(id: string) {
    const ch = channels.find(c => c.id === id);
    if (!ch) return;
    if (!confirm(`Delete conversation "${ch.name}"? All its messages will be removed.`)) return;
    setChannels(prev => prev.filter(c => c.id !== id));
    setMessages(prev => prev.filter(m => m.channelId !== id));
    if (activeId === id) {
      const next = channels.find(c => c.id !== id);
      setActiveId(next?.id ?? "");
    }
    toast.success("Conversation deleted");
  }

  function deleteMessage(id: string) {
    setMessages(prev => prev.filter(m => m.id !== id));
    toast.success("Message deleted");
  }

  function sendMessage() {
    if (!active || !input.trim()) return;
    const now = new Date();
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      channelId: active.id,
      authorId: userId,
      body: input.trim(),
      timestamp: now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
    };
    setMessages((prev) => [...prev, message]);
    setInput("");
  }

  const conversationList = (
    <>
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="text-sm font-semibold">Conversations</h2>
        <div className="flex items-center gap-1">
          <button onClick={() => setNewChatOpen(true)} className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="New chat" title="New chat"><Plus className="size-3.5" /></button>
          <button onClick={() => setConvOpen(false)} className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden" aria-label="Close"><X className="size-3.5" /></button>
        </div>
      </div>
      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5 text-xs text-muted-foreground">
          <Search className="size-3.5" /><input placeholder="Search" className="min-w-0 flex-1 bg-transparent placeholder:text-muted-foreground focus:outline-none" />
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-auto px-2 pb-4 scrollbar-thin">
        <SectionLabel>Channels</SectionLabel>
        {projectChannels.length === 0 && <EmptyHint>No channels yet</EmptyHint>}
        {projectChannels.map(c => (
          <ChannelRow key={c.id} channel={c} active={c.id === activeId} isAdmin={isAdmin}
            onClick={() => { setActiveId(c.id); setConvOpen(false); }}
            onDelete={() => deleteConversation(c.id)} />
        ))}
        <SectionLabel>Direct messages</SectionLabel>
        {dms.length === 0 && <EmptyHint>No direct messages yet</EmptyHint>}
        {dms.map(c => (
          <ChannelRow key={c.id} channel={c} active={c.id === activeId} isAdmin={isAdmin}
            onClick={() => { setActiveId(c.id); setConvOpen(false); }}
            onDelete={() => deleteConversation(c.id)} />
        ))}
        <SectionLabel>AI</SectionLabel>
        <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-accent hover:text-foreground">
          <Sparkles className="size-3.5 text-primary" /> <span className="flex-1 text-left">IntelliTeam AI</span>
        </button>
      </nav>
    </>
  );

  return (
    <AppShell>
      <div className="flex h-full">
        <div className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/30 md:flex">
          {conversationList}
        </div>

        {convOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setConvOpen(false)} />
            <div className="absolute inset-y-0 left-0 flex w-[78%] max-w-[280px] flex-col border-r border-border bg-card shadow-2xl">
              {conversationList}
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          {!active ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-sm text-muted-foreground">
              <Hash className="size-8" />
              <div>No conversations yet. Start a new chat to talk with your team.</div>
              <button onClick={() => setNewChatOpen(true)} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                <Plus className="size-3.5" /> New chat
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-3 sm:px-6">
                <div className="flex min-w-0 items-center gap-2">
                  <button onClick={() => setConvOpen(true)} className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden" aria-label="Conversations"><Menu className="size-4" /></button>
                  {active.type === "dm" ? <AtSign className="size-4 shrink-0 text-muted-foreground" /> : <Hash className="size-4 shrink-0 text-primary" />}
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{active.name}</div>
                    <div className="truncate text-[11px] text-muted-foreground">
                      {active.type === "dm" ? "Direct message" : `${(active.memberIds?.length ?? members.length)} members`}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1 text-muted-foreground">
                  <button className="hidden rounded p-1.5 hover:bg-accent hover:text-foreground sm:block"><Pin className="size-3.5" /></button>
                  <button className="hidden rounded p-1.5 hover:bg-accent hover:text-foreground sm:block"><Bell className="size-3.5" /></button>
                  <button className="rounded p-1.5 hover:bg-accent hover:text-foreground"><Search className="size-3.5" /></button>
                  {isAdmin && (
                    <button
                      onClick={() => deleteConversation(active.id)}
                      className="flex items-center gap-1 rounded border border-destructive/30 bg-destructive/10 px-2 py-1 text-[11px] font-medium text-destructive hover:bg-destructive/20"
                      title="Delete conversation (admin)"
                    >
                      <Trash2 className="size-3" /> Delete
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-auto scrollbar-thin p-4 sm:p-6">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span className="h-px flex-1 bg-border" /> Today <span className="h-px flex-1 bg-border" />
                </div>
                {channelMessages.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                    No messages yet. Say hi 👋
                  </div>
                )}
                {channelMessages.map(m => {
                  const author = members.find(member => member.id === m.authorId) ?? { name: "You", role: "Workspace member", avatarColor: "oklch(0.72 0.16 265)", initials: "ME" };
                  return (
                    <div key={m.id} className="group flex gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-background" style={{ backgroundColor: author.avatarColor }}>{author.initials}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold">{author.name}</span>
                          <span className="text-[10px] text-muted-foreground">{author.role}</span>
                          <span className="text-[10px] text-muted-foreground">{m.timestamp}</span>
                          {isAdmin && (
                            <button
                              onClick={() => deleteMessage(m.id)}
                              className="ml-auto flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-destructive opacity-0 hover:bg-destructive/10 group-hover:opacity-100"
                              title="Delete message (admin)"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          )}
                        </div>
                        <p className="mt-0.5 text-sm leading-relaxed">{m.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-border p-4">
                <div className="rounded-lg border border-border bg-card focus-within:border-primary/50">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder={`Message ${active.type === "dm" ? "@" : "#"}${active.name}`}
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
                    <button onClick={sendMessage} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                      Send <Send className="size-3" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

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
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium">{m.name}</div>
                  <div className="truncate text-[10px] text-muted-foreground">{m.role}</div>
                </div>
                <button
                  onClick={() => createConversation({ mode: "dm", name: m.name, memberIds: [m.id] })}
                  className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                  title={`Message ${m.name}`}
                >
                  <Send className="size-3" />
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {newChatOpen && (
        <NewChatModal
          onClose={() => setNewChatOpen(false)}
          onCreate={createConversation}
        />
      )}
    </AppShell>
  );
}

function NewChatModal({ onClose, onCreate }: { onClose: () => void; onCreate: (p: { mode: NewChatMode; name: string; memberIds: string[] }) => void }) {
  const [mode, setMode] = useState<NewChatMode>("dm");
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(m => m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q));
  }, [query]);

  function toggle(id: string) {
    if (mode === "dm") {
      setSelected([id]);
    } else {
      setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }
  }

  function submit() {
    if (mode === "team") {
      onCreate({ mode, name: name.trim() || "Full Team", memberIds: members.map(m => m.id) });
      return;
    }
    if (selected.length === 0) {
      toast.error(mode === "dm" ? "Select a person to message." : "Select at least one member.");
      return;
    }
    if (mode === "dm") {
      const m = members.find(x => x.id === selected[0])!;
      onCreate({ mode, name: m.name, memberIds: [m.id] });
      return;
    }
    const label = name.trim() || selected.map(id => members.find(m => m.id === id)?.name.split(" ")[0]).filter(Boolean).join(", ");
    onCreate({ mode, name: label || "Group chat", memberIds: selected });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="text-sm font-semibold">New chat</div>
          <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"><X className="size-4" /></button>
        </div>

        <div className="grid grid-cols-3 gap-2 border-b border-border p-3">
          <ModeButton icon={<UserIcon className="size-3.5" />} label="Direct" active={mode === "dm"} onClick={() => { setMode("dm"); setSelected([]); }} />
          <ModeButton icon={<Users className="size-3.5" />} label="Group" active={mode === "group"} onClick={() => { setMode("group"); setSelected([]); }} />
          <ModeButton icon={<Hash className="size-3.5" />} label="Full team" active={mode === "team"} onClick={() => { setMode("team"); setSelected(members.map(m => m.id)); }} />
        </div>

        {(mode === "group" || mode === "team") && (
          <div className="border-b border-border px-3 py-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={mode === "team" ? "Channel name (default: Full Team)" : "Group name (optional)"}
              className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs focus:border-primary/50 focus:outline-none"
            />
          </div>
        )}

        {mode !== "team" && (
          <>
            <div className="border-b border-border px-3 py-2">
              <div className="flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5 text-xs text-muted-foreground">
                <Search className="size-3.5" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search team members" className="min-w-0 flex-1 bg-transparent placeholder:text-muted-foreground focus:outline-none" />
              </div>
              <div className="mt-1.5 text-[10px] text-muted-foreground">
                {mode === "dm" ? "Pick one person to message." : `${selected.length} selected`}
              </div>
            </div>
            <ul className="max-h-72 flex-1 overflow-auto scrollbar-thin">
              {filtered.map(m => {
                const on = selected.includes(m.id);
                return (
                  <li key={m.id}>
                    <button onClick={() => toggle(m.id)} className={`flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-accent/60 ${on ? "bg-accent/40" : ""}`}>
                      <div className="flex size-7 items-center justify-center rounded-full text-[10px] font-semibold text-background" style={{ backgroundColor: m.avatarColor }}>{m.initials}</div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-medium">{m.name}</div>
                        <div className="truncate text-[10px] text-muted-foreground">{m.role}</div>
                      </div>
                      <span className={`flex size-4 items-center justify-center rounded border ${on ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                        {on && <Check className="size-3" />}
                      </span>
                    </button>
                  </li>
                );
              })}
              {filtered.length === 0 && <li className="px-3 py-6 text-center text-xs text-muted-foreground">No members match “{query}”.</li>}
            </ul>
          </>
        )}

        {mode === "team" && (
          <div className="px-4 py-6 text-center text-xs text-muted-foreground">
            This creates a channel with all {members.length} workspace members.
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-border p-3">
          <button onClick={onClose} className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent">Cancel</button>
          <button onClick={submit} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="size-3" /> Start chat
          </button>
        </div>
      </div>
    </div>
  );
}

function ModeButton({ icon, label, active, onClick }: { icon: ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 rounded-md border px-2 py-2 text-[11px] font-medium transition ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground"}`}>
      {icon}
      {label}
    </button>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="px-2 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{children}</div>;
}

function EmptyHint({ children }: { children: ReactNode }) {
  return <div className="px-2 py-1 text-[11px] italic text-muted-foreground/70">{children}</div>;
}

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function ChannelRow({ channel, active, isAdmin, onClick, onDelete }: { channel: ChatChannel; active: boolean; isAdmin: boolean; onClick: () => void; onDelete: () => void }) {
  const Icon = channel.type === "dm" ? AtSign : Hash;
  return (
    <div className={`group flex items-center gap-1 rounded-md pr-1 ${active ? "bg-accent text-foreground" : "text-sidebar-foreground/80 hover:bg-accent/60 hover:text-foreground"}`}>
      <button onClick={onClick} className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-sm">
        <Icon className={`size-3.5 shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
        <span className="flex-1 truncate text-left">{channel.name}</span>
        {channel.unread > 0 && <span className="rounded bg-primary/20 px-1.5 py-px text-[10px] font-semibold text-primary">{channel.unread}</span>}
      </button>
      {isAdmin && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="shrink-0 rounded p-1 text-muted-foreground opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
          title="Delete conversation (admin)"
        >
          <Trash2 className="size-3" />
        </button>
      )}
    </div>
  );
}
