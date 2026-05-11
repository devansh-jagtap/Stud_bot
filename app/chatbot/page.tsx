"use client";

import { useChat } from "@ai-sdk/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BotIcon, UserIcon, SendIcon, ChevronUp, Zap } from "lucide-react";
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

// ─── Bot Model Config ───────────────────────────────────────────────────────
type Model = { id: string; label: string; provider: string };

const BOT_MODELS: Record<string, { free: Model[]; premium: Model[] }> = {
  educational: {
    free: [
      { id: "gemini-3-flash-preview",          label: "Gemini 3 Flash",      provider: "google"      },
      { id: "gemini-3.1-flash-lite-preview",   label: "Gemini 3.1 Flash Lite", provider: "google"    },
      { id: "llama-3.3-70b-versatile",         label: "Llama 3.3 70B",       provider: "groq"        },
      { id: "deepseek/deepseek-r1:free",        label: "DeepSeek R1",         provider: "openrouter"  },
      { id: "moonshotai/kimi-k2:free",          label: "Kimi K2",             provider: "openrouter"  },
      { id: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B", provider: "openrouter" },
    ],
    premium: [
      { id: "google/gemini-3.1-pro",           label: "Gemini 3.1 Pro",      provider: "gateway"     },
      { id: "anthropic/claude-haiku-4",        label: "Claude Haiku 4",      provider: "gateway"     },
    ],
  },
  coding: {
    free: [
      { id: "llama-3.3-70b-versatile",         label: "Llama 3.3 70B",       provider: "groq"        },
      { id: "qwen/qwen3-32b",                  label: "Qwen3 32B",           provider: "groq"        },
      { id: "qwen/qwen3-coder:free",           label: "Qwen3 Coder",         provider: "openrouter"  },
      { id: "openai/gpt-oss-120b:free",        label: "GPT-OSS 120B",        provider: "openrouter"  },
      { id: "deepseek/deepseek-r1:free",       label: "DeepSeek R1",         provider: "openrouter"  },
      { id: "mistralai/devstral-small:free",   label: "Devstral Small",      provider: "openrouter"  },
      { id: "qwen/qwen2.5-coder-32b-instruct", label: "Qwen2.5 Coder 32B",  provider: "nvidia"      },
    ],
    premium: [
      { id: "anthropic/claude-sonnet-4",       label: "Claude Sonnet 4",     provider: "gateway"     },
      { id: "openai/gpt-4.1",                  label: "GPT-4.1",             provider: "gateway"     },
    ],
  },
  work: {
    free: [
      { id: "gemini-3-flash-preview",          label: "Gemini 3 Flash",      provider: "google"      },
      { id: "gemini-3.1-flash-lite-preview",   label: "Gemini 3.1 Flash Lite", provider: "google"   },
      { id: "llama3.1-8b",                     label: "Llama 3.1 8B",        provider: "cerebras"    },
      { id: "mistralai/mistral-small-3.1-24b-instruct:free", label: "Mistral Small", provider: "openrouter" },
      { id: "deepseek/deepseek-chat:free",     label: "DeepSeek V3",         provider: "openrouter"  },
    ],
    premium: [
      { id: "anthropic/claude-haiku-4",        label: "Claude Haiku 4",      provider: "gateway"     },
      { id: "openai/gpt-4.1-mini",             label: "GPT-4.1 Mini",        provider: "gateway"     },
    ],
  },
  content: {
    free: [
      { id: "gemini-3-flash-preview",          label: "Gemini 3 Flash",      provider: "google"      },
      { id: "llama-3.3-70b-versatile",         label: "Llama 3.3 70B",       provider: "groq"        },
      { id: "mistralai/mistral-small-3.1-24b-instruct:free", label: "Mistral Small", provider: "openrouter" },
      { id: "deepseek/deepseek-chat:free",     label: "DeepSeek V3",         provider: "openrouter"  },
      { id: "moonshotai/kimi-k2:free",         label: "Kimi K2",             provider: "openrouter"  },
      { id: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B", provider: "openrouter" },
    ],
    premium: [
      { id: "anthropic/claude-sonnet-4",       label: "Claude Sonnet 4",     provider: "gateway"     },
      { id: "openai/gpt-4.1",                  label: "GPT-4.1",             provider: "gateway"     },
    ],
  },
  image: {
    free: [
      { id: "google/gemini-2.5-flash-preview:free", label: "Nano Banana",   provider: "openrouter"  },
      { id: "google/gemini-3.1-flash-image-preview", label: "Nano Banana 2", provider: "openrouter" },
    ],
    premium: [
      { id: "openai/dall-e-3",                 label: "DALL·E 3",            provider: "gateway"     },
    ],
  },
  video: {
    free: [],
    premium: [
      { id: "google/veo-3",                    label: "Veo 3",               provider: "gateway"     },
      { id: "runway/gen3",                     label: "Runway Gen3",         provider: "gateway"     },
    ],
  },
};

const PROVIDER_COLORS: Record<string, string> = {
  google:      "bg-blue-100 text-blue-700",
  groq:        "bg-orange-100 text-orange-700",
  openrouter:  "bg-purple-100 text-purple-700",
  nvidia:      "bg-green-100 text-green-700",
  cerebras:    "bg-pink-100 text-pink-700",
  gateway:     "bg-amber-100 text-amber-700",
};

// ────────────────────────────────────────────────────────────────────────────

function ChatBotInner() {
  const [isPremium, setIsPremium]         = useState(false);
  const [showModels, setShowModels]       = useState(false);
  const searchParams                      = useSearchParams();
  const router                            = useRouter();

  const [sessionId, setSessionId]         = useState<string>(() => searchParams.get("id") ?? newId());
  const botType                           = searchParams.get("bot") ?? "educational";
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);

  const botModels   = BOT_MODELS[botType] ?? BOT_MODELS.educational;
  const defaultModel = isPremium ? botModels.premium[0] : botModels.free[0];
  const [selectedModel, setSelectedModel] = useState<Model>(defaultModel);

  // When premium toggle changes, reset to first available model
  useEffect(() => {
    const list = isPremium ? botModels.premium : botModels.free;
    if (list.length > 0) setSelectedModel(list[0]);
  }, [isPremium, botType]);

  const { messages, sendMessage, status, setMessages } = useChat({
    id: sessionId,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { botType, isPremium, selectedModel: selectedModel.id },
    }),
  });

  const isLoading = status === "submitted" || status === "streaming";
  const [input, setInput] = useState("");

  const setMessagesRef = useRef(setMessages);
  setMessagesRef.current = setMessages;

  useEffect(() => {
    const stored = getSession(sessionId);
    if (stored) setMessagesRef.current(stored.messages as UIMessage[]);
    else setMessagesRef.current([]);
  }, [sessionId]);

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
    router.replace(`/chatbot?bot=${botType}&id=${id}`);
  }, [router, botType]);

  const handleSelectSession = useCallback((id: string) => {
    setSessionId(id);
    router.replace(`/chatbot?bot=${botType}&id=${id}`);
  }, [router, botType]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    await sendMessage({ text });
  };

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const availableModels = isPremium ? botModels.premium : botModels.free;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <ChatSidebar
        activeId={sessionId}
        onNew={handleNewChat}
        onSelect={handleSelectSession}
        refreshKey={sidebarRefreshKey}
      />

      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="border-b bg-card px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                <BotIcon className="size-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold capitalize">{botType} Assistant</h1>
                <p className="text-sm text-muted-foreground">{selectedModel.label}</p>
              </div>
            </div>
            <button
              onClick={() => setIsPremium(p => !p)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors",
                isPremium ? "bg-amber-400 text-black border-amber-400" : "bg-white text-neutral-500 border-neutral-300"
              )}
            >
              {isPremium ? "⚡ Premium" : "Free"}
            </button>
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
                    Using <span className="font-medium">{selectedModel.label}</span> · Switch models below
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
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                      )}>
                        {message.role === "user" ? <UserIcon className="size-4" /> : <BotIcon className="size-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "rounded-lg px-4 py-3 max-w-[80%]",
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
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
          <div className="mx-auto max-w-3xl space-y-2">

            {/* Model Selector Popup */}
            {showModels && (
              <div className="rounded-xl border bg-white shadow-lg p-3 space-y-1">
                <p className="text-xs font-semibold text-neutral-400 px-2 pb-1">
                  {isPremium ? "⚡ Premium Models" : "Free Models"}
                </p>
                {availableModels.length === 0 ? (
                  <p className="text-xs text-neutral-400 px-2 py-2">
                    No free models for video. Enable premium.
                  </p>
                ) : (
                  availableModels.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => { setSelectedModel(m); setShowModels(false); }}
                      className={cn(
                        "w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-neutral-50",
                        selectedModel.id === m.id && "bg-neutral-100 font-medium"
                      )}
                    >
                      <span>{m.label}</span>
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", PROVIDER_COLORS[m.provider])}>
                        {m.provider}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-2">
              {/* Model picker button */}
              <button
                type="button"
                onClick={() => setShowModels(s => !s)}
                className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-50 transition-colors shrink-0"
              >
                <Zap className="size-3" />
                {selectedModel.label}
                <ChevronUp className={cn("size-3 transition-transform", !showModels && "rotate-180")} />
              </button>

              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1"
                autoComplete="off"
              />
              <Button type="submit" disabled={isLoading || !input?.trim()} size="icon">
                <SendIcon className="size-4" />
              </Button>
            </form>
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