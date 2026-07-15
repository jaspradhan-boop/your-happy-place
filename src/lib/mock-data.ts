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

export const projects: Project[] = [];

export const tasks: Task[] = [];

export type ChatChannel = { id: string; name: string; type: "channel" | "dm" | "project"; unread: number; projectId?: string; memberIds?: string[] };

export const channels: ChatChannel[] = [];

export type ChatMessage = { id: string; channelId: string; authorId: string; body: string; timestamp: string; reactions?: { emoji: string; count: number }[]; aiTagged?: boolean };

export const messages: ChatMessage[] = [];

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
