"use client";

import { useEffect, useState } from "react";
import { PlusIcon, Trash2Icon, MessageSquareIcon, PanelLeftCloseIcon, PanelLeftOpenIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { listSessions, deleteSession, type ChatSession } from "@/lib/chat-history";

type Props = {
  activeId: string | null;
  onNew: () => void;
  onSelect: (id: string) => void;
  refreshKey?: number;
};

type Group = { label: string; sessions: ChatSession[] };

function groupSessions(sessions: ChatSession[]): Group[] {
  const now = Date.now();
  const DAY = 86_400_000;

  const today: ChatSession[] = [];
  const yesterday: ChatSession[] = [];
  const week: ChatSession[] = [];
  const older: ChatSession[] = [];

  for (const s of sessions) {
    const diff = now - s.updatedAt;
    if (diff < DAY) today.push(s);
    else if (diff < 2 * DAY) yesterday.push(s);
    else if (diff < 7 * DAY) week.push(s);
    else older.push(s);
  }

  const groups: Group[] = [];
  if (today.length) groups.push({ label: "Today", sessions: today });
  if (yesterday.length) groups.push({ label: "Yesterday", sessions: yesterday });
  if (week.length) groups.push({ label: "Previous 7 Days", sessions: week });
  if (older.length) groups.push({ label: "Older", sessions: older });
  return groups;
}

export default function ChatSidebar({ activeId, onNew, onSelect, refreshKey }: Props) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setSessions(listSessions());
  }, [refreshKey]);

  function handleDelete(e: React.MouseEvent | React.KeyboardEvent, id: string) {
    e.stopPropagation();
    deleteSession(id);
    setSessions(listSessions());
    if (activeId === id) onNew();
  }

  const groups = groupSessions(sessions);

  return (
    <>
      {/* Collapsed rail */}
      {collapsed && (
        <div className="flex h-full w-12 flex-col items-center gap-3 border-r border-neutral-200 bg-neutral-50 py-4">
          <button
            onClick={() => setCollapsed(false)}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
            title="Open sidebar"
          >
            <PanelLeftOpenIcon className="h-5 w-5" />
          </button>
          <button
            onClick={onNew}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
            title="New chat"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Expanded sidebar */}
      {!collapsed && (
        <div className="flex h-full w-64 flex-col border-r border-neutral-200 bg-neutral-50 shrink-0">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
            <button
              onClick={onNew}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 transition-colors"
            >
              <PlusIcon className="h-4 w-4" />
              New Chat
            </button>
            <button
              onClick={() => setCollapsed(true)}
              className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 transition-colors"
              title="Close sidebar"
            >
              <PanelLeftCloseIcon className="h-4 w-4" />
            </button>
          </div>

          {/* History list */}
          <div className="flex-1 overflow-y-auto py-2">
            {groups.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-neutral-400">
                No conversations yet
              </div>
            ) : (
              groups.map((group) => (
                <div key={group.label} className="mb-2">
                  <p className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                    {group.label}
                  </p>
                  {group.sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => onSelect(session.id)}
                      className={cn(
                        "group flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors",
                        activeId === session.id
                          ? "bg-neutral-200 text-neutral-900 font-medium"
                          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                      )}
                    >
                      <MessageSquareIcon className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                      <span className="flex-1 truncate">{session.title}</span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => handleDelete(e, session.id)}
                        onKeyDown={(e) => e.key === "Enter" && handleDelete(e, session.id)}
                        className="invisible shrink-0 rounded p-0.5 text-neutral-400 hover:text-red-500 group-hover:visible transition-colors"
                        title="Delete conversation"
                      >
                        <Trash2Icon className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
