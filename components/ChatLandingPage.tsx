"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap, Code2, ImageIcon, Briefcase,
  PenLine, Video, Sparkles, ArrowRight,
} from "lucide-react";

type ChatType = {
  id: string;
  title: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
  accent: string;
};

const CHAT_TYPES: ChatType[] = [
  { id: "educational", title: "Educational",        description: "Learn any topic with patient, structured explanations.", Icon: GraduationCap, accent: "bg-blue-50 text-blue-600"      },
  { id: "coding",      title: "Coding Assistant",   description: "Pair-program, debug, and ship faster across stacks.",   Icon: Code2,         accent: "bg-violet-50 text-violet-600"  },
  { id: "image",       title: "Image Generation",   description: "Turn ideas into polished visuals in seconds.",          Icon: ImageIcon,     accent: "bg-pink-50 text-pink-600"      },
  { id: "work",        title: "Work Assistant",     description: "Draft emails, summarize meetings, plan your week.",     Icon: Briefcase,     accent: "bg-amber-50 text-amber-600"    },
  { id: "content",     title: "Content Generation", description: "Posts, scripts, and copy that actually sound human.",   Icon: PenLine,       accent: "bg-emerald-50 text-emerald-600"},
  { id: "video",       title: "Video Generation",   description: "Storyboard and generate short videos with ease.",       Icon: Video,         accent: "bg-rose-50 text-rose-600"      },
];

export default function ChatLandingPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const active = CHAT_TYPES.find((t) => t.id === selected) ?? null;
  const router = useRouter();

  return (
    <main className="relative min-h-screen bg-[#ffffff] text-neutral-900">

      <div className="relative mx-auto max-w-6xl px-8 pb-40 pt-5">

        {/* Nav — logo left, links truly centered, sign in right */}
        <header className="mb-14 grid grid-cols-3 items-center">
          {/* Left: logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Lumen</span>
          </div>

          {/* Center: nav links */}
          <nav className="hidden sm:flex items-center justify-center gap-8 text-sm text-neutral-500">
            <a href="#" className="hover:text-neutral-900 transition-colors">Pricing</a>
            <a href="#" className="hover:text-neutral-900 transition-colors">Docs</a>
          </nav>

          {/* Right: sign in */}
          <div className="flex justify-end">
            <button className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-700 transition-colors">
              Sign in
            </button>
          </div>
        </header>

        {/* Hero — fully centered */}
        <section className="mb-12 text-center">
          {/* Eyebrow pill */}
          <div className="mb-10 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-sm text-neutral-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
              One workspace · Many minds
            </div>
          </div>

          {/* Big two-line title */}
          <h1 className="text-[clamp(1.8rem,6vw,3rem)] font-extrabold leading-[1.08] tracking-tight">
            <span className="text-neutral-900">Pick the assistant.</span>
            <br />
            <span className="text-neutral-400">Start the conversation.</span>
          </h1>

          {/* Subtitle — centered, under the title */}
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-neutral-500">
            Choose how you want to think today — code, write, learn, or create.
            Each chat is tuned for the job.
          </p>
        </section>

        {/* Card grid — no label above */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CHAT_TYPES.map((t) => {
            const isActive = selected === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelected(t.id)}
                className={[
                  "group relative flex flex-col items-start rounded-2xl border p-5 text-left transition-all duration-150",
                  "hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)]",
                  isActive
                    ? "border-neutral-900 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.09)]"
                    : "border-neutral-200 bg-white",
                ].join(" ")}
              >
                <div className={["flex h-10 w-10 items-center justify-center rounded-xl", t.accent].join(" ")}>
                  <t.Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold tracking-tight">{t.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-500">{t.description}</p>
                <span className={["mt-4 inline-flex items-center gap-1 text-xs font-medium", isActive ? "text-neutral-900" : "text-neutral-400"].join(" ")}>
                  {isActive ? "Selected" : "Choose"}
                  <ArrowRight className="h-3 w-3" />
                </span>
                {isActive && (
                  <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-neutral-900" />
                )}
              </button>
            );
          })}
        </section>

        <p className="mt-12 text-center text-xs text-neutral-400">
          No credit card required · Free during beta
        </p>
      </div>

      {/* Floating CTA */}
      <div className={[
        "pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 transition-all duration-300",
        active ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      ].join(" ")}>
        {active && (
          <button
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(0,0,0,0.25)] transition hover:bg-neutral-700"
            onClick={() => router.push("/chatbot")}
          >
            <Sparkles className="h-4 w-4" />
            Start {active.title} chat
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </main>
  );
}