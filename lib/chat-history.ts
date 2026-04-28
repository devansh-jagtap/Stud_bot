import type { UIMessage } from "ai";

export type ChatSession = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: UIMessage[];
};

const STORAGE_KEY = "stud_bot_chat_sessions";

function loadAll(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as ChatSession[];
  } catch {
    return [];
  }
}

function saveAll(sessions: ChatSession[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function listSessions(): ChatSession[] {
  return loadAll().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getSession(id: string): ChatSession | null {
  return loadAll().find((s) => s.id === id) ?? null;
}

export function saveSession(session: ChatSession): void {
  const sessions = loadAll();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx === -1) {
    sessions.push(session);
  } else {
    sessions[idx] = session;
  }
  saveAll(sessions);
}

export function deleteSession(id: string): void {
  saveAll(loadAll().filter((s) => s.id !== id));
}

export function sessionTitle(messages: UIMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "New Chat";
  const text =
    first.parts
      ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join(" ")
      .trim() ?? "";
  return text.length > 60 ? text.slice(0, 60) + "…" : text || "New Chat";
}
