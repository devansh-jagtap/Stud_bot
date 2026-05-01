"use client";

import { useChat } from "@ai-sdk/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BotIcon, UserIcon, SendIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ChatSidebar from "@/components/ChatSidebar";
import { saveSession, getSession, sessionTitle, type ChatSession } from "@/lib/chat-history";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

function ChatBotInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [sessionId, setSessionId] = useState<string>(() => searchParams.get("id") ?? newId());
  const botType = searchParams.get("bot") ?? "educational";
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);

  const { messages, sendMessage, status, setMessages } = useChat({
    id: sessionId,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { botType },
    }),
  });
  const isLoading = status === "submitted" || status === "streaming";
  const [input, setInput] = useState("");

  // Restore session from localStorage when sessionId changes
  // setMessages is stable (from useChat) so it's safe to omit from deps
  const setMessagesRef = useRef(setMessages);
  setMessagesRef.current = setMessages;

  useEffect(() => {
    const stored = getSession(sessionId);
    if (stored) {
      setMessagesRef.current(stored.messages as UIMessage[]);
    } else {
      setMessagesRef.current([]);
    }
  }, [sessionId]);

  // Persist session whenever messages change (after at least one message)
  useEffect(() => {
    if (messages.length === 0) return;
    const session: ChatSession = {
      id: sessionId,
      title: sessionTitle(messages as UIMessage[]),
      createdAt: getSession(sessionId)?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
      messages: messages as UIMessage[],
    };
    saveSession(session);
    setSidebarRefreshKey((k) => k + 1);
  }, [messages, sessionId]);

  const handleNewChat = useCallback(() => {
    const id = newId();
    setSessionId(id);
    setInput("");
    router.replace(`/chatbot?id=${id}`);
  }, [router]);

  const handleSelectSession = useCallback(
    (id: string) => {
      setSessionId(id);
      router.replace(`/chatbot?id=${id}`);
    },
    [router]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    await sendMessage({ text });
  };

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <ChatSidebar
        activeId={sessionId}
        onNew={handleNewChat}
        onSelect={handleSelectSession}
        refreshKey={sidebarRefreshKey}
      />

      {/* Main chat area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="border-b bg-card px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <BotIcon className="size-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold capitalize">{botType} Assistant</h1>
              <p className="text-sm text-muted-foreground">Powered by Gemini 2.5 Flash</p>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-4 p-6">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <div className="flex size-20 items-center justify-center rounded-full bg-muted mb-4">
                    <BotIcon className="size-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Ask me anything and I'll do my best to help you
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3 max-w-3xl",
                      message.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    <Avatar className="mt-1 shrink-0 size-8">
                      <AvatarFallback className={cn(
                        "flex items-center justify-center",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      )}>
                        {message.role === "user" ? (
                          <UserIcon className="size-4" />
                        ) : (
                          <BotIcon className="size-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <div className={cn(
                      "rounded-lg px-4 py-3 max-w-[80%]",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}>
                      <div className="text-sm whitespace-pre-wrap">
                        {message.parts?.map((part, i) =>
                          part.type === "text" ? <span key={i}>{part.text}</span> : null
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex gap-3 max-w-3xl mr-auto">
                  <Avatar className="mt-1 shrink-0 size-8">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      <BotIcon className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-4 py-3 bg-muted">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="size-2 animate-bounce rounded-full bg-foreground [animation-delay:-0.3s]" />
                        <span className="size-2 animate-bounce rounded-full bg-foreground [animation-delay:-0.15s]" />
                        <span className="size-2 animate-bounce rounded-full bg-foreground" />
                      </div>
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="border-t bg-card p-4 shrink-0">
          <div className="mx-auto max-w-3xl">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1"
                autoComplete="off"
              />
              <Button
                type="submit"
                disabled={isLoading || !input?.trim()}
                size="icon"
              >
                <SendIcon className="size-4" />
              </Button>
            </form>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Press Enter to send, Shift + Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatBot() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-muted-foreground">Loading…</div>}>
      <ChatBotInner />
    </Suspense>
  );
}