export type Priority = "low" | "medium" | "high" | "critical";
export type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "done";
export type ProjectStatus = "planning" | "active" | "at_risk" | "on_hold" | "completed";

export interface Member {
  id: string;
  name: string;
  role: string;
  email: string;
  avatarColor: string;
  initials: string;
  online: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assigneeId: string;
  projectId: string;
  dueDate: string;
  progress: number;
  estimateHours: number;
  actualHours: number;
  riskScore: number;
  tags: string[];
  aiSuggestion?: string;
}

export interface Project {
  id: string;
  key: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  health: number;
  risk: number;
  budget: number;
  spent: number;
  startDate: string;
  dueDate: string;
  managerId: string;
  memberIds: string[];
  department: string;
  priority: Priority;
  aiForecast: {
    completion: string;
    confidence: number;
    predictedDelay: number;
    recommendation: string;
  };
}

export const members: Member[] = [
  { id: "u1", name: "Aarav Mehta", role: "Program Manager", email: "aarav@intelliteam.ai", avatarColor: "oklch(0.72 0.16 265)", initials: "AM", online: true },
  { id: "u2", name: "Sofia Rossi", role: "Lead PLC Engineer", email: "sofia@intelliteam.ai", avatarColor: "oklch(0.72 0.15 152)", initials: "SR", online: true },
  { id: "u3", name: "Kenji Tanaka", role: "SCADA Architect", email: "kenji@intelliteam.ai", avatarColor: "oklch(0.78 0.15 78)", initials: "KT", online: false },
  { id: "u4", name: "Priya Sharma", role: "Electrical Engineer", email: "priya@intelliteam.ai", avatarColor: "oklch(0.72 0.14 235)", initials: "PS", online: true },
  { id: "u5", name: "Lucas Silva", role: "Automation Engineer", email: "lucas@intelliteam.ai", avatarColor: "oklch(0.68 0.2 320)", initials: "LS", online: true },
  { id: "u6", name: "Nadia Haddad", role: "Commissioning Lead", email: "nadia@intelliteam.ai", avatarColor: "oklch(0.72 0.16 25)", initials: "NH", online: false },
  { id: "u7", name: "Chen Wei", role: "Mechanical Engineer", email: "chen@intelliteam.ai", avatarColor: "oklch(0.7 0.14 195)", initials: "CW", online: true },
  { id: "u8", name: "Olivia Brooks", role: "Documentation Lead", email: "olivia@intelliteam.ai", avatarColor: "oklch(0.72 0.14 340)", initials: "OB", online: true },
];

export const projects: Project[] = [
  { id: "p1", key: "APX", name: "Apex Robotics Line 4", description: "End-to-end automation of Line 4 including PLC upgrade, SCADA integration, and vision inspection.", status: "active", progress: 68, health: 82, risk: 34, budget: 1_250_000, spent: 812_000, startDate: "2026-02-01", dueDate: "2026-09-30", managerId: "u1", memberIds: ["u1","u2","u3","u4","u5","u8"], department: "Industrial Automation", priority: "high", aiForecast: { completion: "2026-10-08", confidence: 0.86, predictedDelay: 8, recommendation: "Add one contract PLC engineer to recover 5 days on the commissioning path." } },
  { id: "p2", key: "HVX", name: "Helix Water Treatment SCADA", description: "Multi-site SCADA rollout with OPC UA, redundant historian, and remote diagnostics.", status: "at_risk", progress: 41, health: 58, risk: 71, budget: 780_000, spent: 512_000, startDate: "2026-01-15", dueDate: "2026-08-15", managerId: "u1", memberIds: ["u1","u3","u4","u6","u8"], department: "Utilities", priority: "critical", aiForecast: { completion: "2026-09-04", confidence: 0.72, predictedDelay: 20, recommendation: "Sensor vendor lead time is the bottleneck. Consider approved alternate: Endress+Hauser PMC71." } },
  { id: "p3", key: "NVA", name: "Nova Packaging Retrofit", description: "Retrofit legacy packaging cell with new servos, safety PLC, and MES integration.", status: "active", progress: 24, health: 74, risk: 42, budget: 460_000, spent: 118_000, startDate: "2026-05-01", dueDate: "2026-12-15", managerId: "u1", memberIds: ["u1","u2","u5","u7"], department: "Manufacturing", priority: "medium", aiForecast: { completion: "2026-12-11", confidence: 0.91, predictedDelay: 0, recommendation: "On track. Front-load safety validation to protect December window." } },
  { id: "p4", key: "ORN", name: "Orion Substation Monitoring", description: "IEC 61850 monitoring platform with anomaly detection and mobile alerting.", status: "planning", progress: 8, health: 88, risk: 22, budget: 620_000, spent: 34_000, startDate: "2026-07-01", dueDate: "2027-02-28", managerId: "u1", memberIds: ["u1","u4","u6","u8"], department: "Power Systems", priority: "high", aiForecast: { completion: "2027-02-22", confidence: 0.94, predictedDelay: -4, recommendation: "Kickoff readiness is strong. Lock vendor SLA before design freeze." } },
  { id: "p5", key: "ZPH", name: "Zephyr Wind Farm Comms", description: "Site-to-cloud MQTT gateway, edge analytics, and cybersecurity hardening.", status: "completed", progress: 100, health: 96, risk: 8, budget: 340_000, spent: 331_000, startDate: "2025-09-01", dueDate: "2026-06-30", managerId: "u1", memberIds: ["u1","u3","u5","u6"], department: "Renewables", priority: "medium", aiForecast: { completion: "2026-06-24", confidence: 1, predictedDelay: -6, recommendation: "Publish as reference architecture for future wind projects." } },
];

export const tasks: Task[] = [
  { id: "t1", projectId: "p1", title: "PLC I/O mapping — Cell A", description: "Finalize I/O tag list against ISA-5.1 and export to Studio 5000.", status: "in_progress", priority: "high", assigneeId: "u2", dueDate: "2026-07-22", progress: 72, estimateHours: 24, actualHours: 18, riskScore: 28, tags: ["PLC","Design"], aiSuggestion: "3 tags conflict with legacy naming. Auto-rename?" },
  { id: "t2", projectId: "p1", title: "SCADA screen — Line overview", description: "Design master overview with alarm banner and KPI tiles.", status: "review", priority: "medium", assigneeId: "u3", dueDate: "2026-07-18", progress: 90, estimateHours: 16, actualHours: 17, riskScore: 12, tags: ["SCADA","UI"] },
  { id: "t3", projectId: "p1", title: "Vision system FAT protocol", description: "Draft FAT protocol including edge cases for reflective parts.", status: "todo", priority: "high", assigneeId: "u5", dueDate: "2026-07-28", progress: 0, estimateHours: 20, actualHours: 0, riskScore: 44, tags: ["Vision","QA"], aiSuggestion: "Reuse protocol from ZPH project — 82% overlap." },
  { id: "t4", projectId: "p1", title: "Panel wiring — station 3", description: "Complete wiring per drawing rev C and update as-built.", status: "in_progress", priority: "medium", assigneeId: "u4", dueDate: "2026-07-25", progress: 45, estimateHours: 32, actualHours: 14, riskScore: 22, tags: ["Electrical"] },
  { id: "t5", projectId: "p1", title: "Safety validation report", description: "Perform SIL2 validation and file report.", status: "backlog", priority: "critical", assigneeId: "u2", dueDate: "2026-08-05", progress: 0, estimateHours: 40, actualHours: 0, riskScore: 66, tags: ["Safety","Compliance"], aiSuggestion: "Schedule before commissioning to avoid 10-day rework." },
  { id: "t6", projectId: "p2", title: "OPC UA server sizing", description: "Confirm tag counts and CPU headroom for 3 sites.", status: "in_progress", priority: "high", assigneeId: "u3", dueDate: "2026-07-19", progress: 55, estimateHours: 12, actualHours: 8, riskScore: 38, tags: ["SCADA","Infra"] },
  { id: "t7", projectId: "p2", title: "Transmitter alternate sourcing", description: "Qualify Endress+Hauser PMC71 as alternate.", status: "todo", priority: "critical", assigneeId: "u4", dueDate: "2026-07-21", progress: 0, estimateHours: 8, actualHours: 0, riskScore: 74, tags: ["Supply","Risk"], aiSuggestion: "Auto-generate RFQ from datasheet." },
  { id: "t8", projectId: "p2", title: "Cybersecurity baseline", description: "Apply IEC 62443 baseline and document.", status: "review", priority: "high", assigneeId: "u6", dueDate: "2026-07-17", progress: 85, estimateHours: 24, actualHours: 22, riskScore: 18, tags: ["Security"] },
  { id: "t9", projectId: "p3", title: "Servo selection matrix", description: "Compare 3 vendors on torque, footprint, lead time.", status: "in_progress", priority: "medium", assigneeId: "u7", dueDate: "2026-07-30", progress: 30, estimateHours: 16, actualHours: 5, riskScore: 20, tags: ["Mechanical"] },
  { id: "t10", projectId: "p3", title: "MES tag mapping draft", description: "Draft tag mapping to existing MES schema.", status: "todo", priority: "medium", assigneeId: "u5", dueDate: "2026-08-02", progress: 0, estimateHours: 20, actualHours: 0, riskScore: 26, tags: ["MES","Integration"] },
  { id: "t11", projectId: "p4", title: "IEC 61850 gap analysis", description: "Analyze existing substations for 61850 readiness.", status: "in_progress", priority: "high", assigneeId: "u4", dueDate: "2026-07-24", progress: 40, estimateHours: 28, actualHours: 11, riskScore: 30, tags: ["Substation","Analysis"] },
  { id: "t12", projectId: "p1", title: "Commissioning schedule v1", description: "Draft commissioning schedule with milestone gates.", status: "done", priority: "medium", assigneeId: "u6", dueDate: "2026-07-05", progress: 100, estimateHours: 12, actualHours: 10, riskScore: 8, tags: ["Commissioning"] },
];

export type ChatChannel = { id: string; name: string; type: "channel" | "dm" | "project"; unread: number; projectId?: string; memberIds?: string[] };

export const channels: ChatChannel[] = [
  { id: "c1", name: "general", type: "channel", unread: 0 },
  { id: "c2", name: "announcements", type: "channel", unread: 2 },
  { id: "c3", name: "APX — Apex Robotics", type: "project", unread: 5, projectId: "p1" },
  { id: "c4", name: "HVX — Helix SCADA", type: "project", unread: 12, projectId: "p2" },
  { id: "c5", name: "NVA — Nova Packaging", type: "project", unread: 0, projectId: "p3" },
  { id: "c6", name: "Sofia Rossi", type: "dm", unread: 1, memberIds: ["u2"] },
  { id: "c7", name: "Kenji Tanaka", type: "dm", unread: 0, memberIds: ["u3"] },
];

export type ChatMessage = { id: string; channelId: string; authorId: string; body: string; timestamp: string; reactions?: { emoji: string; count: number }[]; aiTagged?: boolean };

export const messages: ChatMessage[] = [
  { id: "m1", channelId: "c3", authorId: "u2", body: "Just pushed the I/O mapping draft. @Kenji can you sanity check the alarm tags?", timestamp: "09:12", reactions: [{ emoji: "👀", count: 2 }] },
  { id: "m2", channelId: "c3", authorId: "u3", body: "On it. Also — the overview screen is ready for review, sharing screenshot.", timestamp: "09:14" },
  { id: "m3", channelId: "c3", authorId: "u1", body: "Great. Reminder: FAT protocol needs a first pass by Friday.", timestamp: "09:16", reactions: [{ emoji: "✅", count: 3 }] },
  { id: "m4", channelId: "c3", authorId: "u5", body: "I'll take the FAT protocol. AI suggested reusing ZPH — 82% overlap, saves ~2 days.", timestamp: "09:19", aiTagged: true },
  { id: "m5", channelId: "c3", authorId: "u4", body: "Panel wiring at station 3 is 45%. Blocker: waiting on cable trays.", timestamp: "09:22" },
  { id: "m6", channelId: "c3", authorId: "u1", body: "Escalating to supply chain. AI, draft an email to the vendor please.", timestamp: "09:23", aiTagged: true },
];

export const activity = [
  { id: "a1", who: "Sofia Rossi", what: "closed", target: "Commissioning schedule v1", when: "2h ago", type: "task" as const },
  { id: "a2", who: "Kenji Tanaka", what: "requested review on", target: "SCADA screen — Line overview", when: "3h ago", type: "review" as const },
  { id: "a3", who: "IntelliTeam AI", what: "flagged risk on", target: "Transmitter alternate sourcing", when: "4h ago", type: "risk" as const },
  { id: "a4", who: "Priya Sharma", what: "uploaded drawing to", target: "Apex Robotics Line 4", when: "5h ago", type: "file" as const },
  { id: "a5", who: "Nadia Haddad", what: "approved", target: "Cybersecurity baseline", when: "6h ago", type: "approval" as const },
  { id: "a6", who: "Lucas Silva", what: "commented on", target: "Vision system FAT protocol", when: "7h ago", type: "comment" as const },
];

export const kpis = {
  productivity: 87,
  onTimeDelivery: 92,
  utilization: 78,
  aiActionsToday: 41,
  activeProjects: projects.filter(p => p.status === "active" || p.status === "at_risk").length,
  atRiskProjects: projects.filter(p => p.status === "at_risk").length,
  openTasks: tasks.filter(t => t.status !== "done").length,
  overdueTasks: 3,
};

export function memberById(id: string) {
  return members.find(m => m.id === id)!;
}
export function projectById(id: string) {
  return projects.find(p => p.id === id);
}
export function tasksByProject(projectId: string) {
  return tasks.filter(t => t.projectId === projectId);
}
