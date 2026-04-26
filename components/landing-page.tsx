"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Bot, ChevronRight, Send } from "lucide-react";

const searchTabs = ["search", "extract", "crawl", "research"] as const;

type SearchTab = (typeof searchTabs)[number];

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
  className?: string;
};

function Button({ children, href, variant = "primary", className = "" }: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

  const variantClasses =
    variant === "primary"
      ? "bg-[#2f2d2b] text-white shadow-[0_10px_30px_rgba(47,45,43,0.18)] hover:-translate-y-0.5 hover:bg-[#22201f]"
      : "border border-black/10 bg-white/70 text-[#2f2d2b] shadow-sm hover:-translate-y-0.5 hover:bg-white";

  if (href) {
    return (
      <Link href={href} className={`${baseClasses} ${variantClasses} ${className}`}>
        {children}
      </Link>
    );
  }

  return <button type="button" className={`${baseClasses} ${variantClasses} ${className}`}>{children}</button>;
}

function SearchBox() {
  const [prompt, setPrompt] = useState("What are the latest updates with Nvidia?");
  const [activeTab, setActiveTab] = useState<SearchTab>("search");

  return (
    <form
      className="w-full max-w-5xl rounded-[2rem] border border-white/70 bg-white/45 p-4 shadow-[0_24px_70px_rgba(58,72,75,0.12)] backdrop-blur-xl sm:p-5 lg:p-6"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="rounded-[1.5rem] border border-white/70 bg-white/35 p-4 shadow-inner shadow-white/30 sm:p-6">
        <label htmlFor="landing-prompt" className="sr-only">
          Example prompt
        </label>

        <div className="rounded-[1.25rem] border border-black/5 bg-white/75 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-shadow duration-200 focus-within:shadow-[0_0_0_4px_rgba(16,185,129,0.12)] sm:px-5 sm:py-4">
          <input
            id="landing-prompt"
            type="text"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Ask anything..."
            className="w-full border-0 bg-transparent text-[clamp(1rem,1.4vw,1.1rem)] font-medium text-[#2e2c2a] outline-none placeholder:text-black/30"
          />
        </div>

        <div className="mt-5 flex flex-col gap-4 sm:mt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-h-14 flex-wrap items-center gap-2 rounded-full border border-black/5 bg-black/5 px-2 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]">
            {searchTabs.map((tab) => {
              const isActive = activeTab === tab;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[#2f2d2b] text-white shadow-[0_10px_20px_rgba(47,45,43,0.18)]"
                      : "text-black/40 hover:bg-white/70 hover:text-black/60"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <button
            type="submit"
            aria-label="Submit prompt"
            className="ml-auto flex h-14 w-14 items-center justify-center rounded-full border border-black/5 bg-[#f2eadc] text-[#2f2d2b] shadow-[0_10px_20px_rgba(47,45,43,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#ece1ce] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          >
            <Send className="h-5 w-5 -rotate-45" />
          </button>
        </div>
      </div>
    </form>
  );
}

function HeroSection() {
  return (
    <section className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-5 py-10 text-center sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200/25 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-24 h-80 w-80 rounded-full bg-sky-200/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-0 h-72 w-72 rounded-full bg-amber-100/35 blur-3xl" />

      <div className="relative max-w-4xl">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/65 px-4 py-2 text-sm font-medium text-black/55 shadow-sm backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          AI agents connected to the web
        </div>

        <h1 className="text-[clamp(3rem,6vw,6rem)] font-semibold leading-[0.92] tracking-[-0.07em] text-[#2f2d2b] sm:text-[clamp(3.5rem,7vw,6.5rem)]">
          Connect your AI agents
        </h1>
        <h2 className="mt-2 bg-linear-to-r from-gray-800 to-green-500 bg-clip-text text-[clamp(2.8rem,5.6vw,5.5rem)] font-semibold leading-[0.96] tracking-[-0.07em] text-transparent sm:text-[clamp(3.2rem,6vw,6rem)]">
          to the web
        </h2>

        <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-black/60 sm:text-lg">
          Real-time search, extraction, research, and web crawling through a single, secure API.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Button href="/chatbot" variant="primary">
            Talk to an expert
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button href="#search-box" variant="secondary">
            Try it out →
          </Button>
        </div>
      </div>

      <div id="search-box" className="relative z-10 mt-14 w-full">
        <SearchBox />
      </div>
    </section>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <article className="rounded-[1.75rem] border border-white/70 bg-white/55 p-6 shadow-[0_18px_50px_rgba(47,45,43,0.08)] backdrop-blur sm:p-7">
      <h3 className="text-xl font-semibold tracking-tight text-[#2f2d2b]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-black/60 sm:text-base">{description}</p>
      <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
        Learn more <ChevronRight className="h-4 w-4" />
      </div>
    </article>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-black/40 sm:text-sm">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#2f2d2b] sm:text-4xl lg:text-5xl">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-black/58 sm:text-base lg:text-lg">{description}</p>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f4ed] text-[#2e2c2a]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(255,255,255,0.55)_34%,rgba(240,243,224,0.4)_58%,rgba(169,211,206,0.45)_78%,rgba(154,202,210,0.55)_100%)]" />
      <div className="pointer-events-none absolute -left-24 top-24 h-80 w-80 rounded-full bg-emerald-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-36 h-96 w-96 rounded-full bg-sky-200/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-amber-100/30 blur-3xl" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold tracking-tight text-[#2e2c2a]">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur">
            <Bot className="h-5 w-5" />
          </span>
          <span className="text-base">Chat Assist</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-black/55 md:flex">
          <a href="#features" className="transition-colors hover:text-black/80">
            Features
          </a>
          <a href="#examples" className="transition-colors hover:text-black/80">
            Examples
          </a>
          <a href="#footer" className="transition-colors hover:text-black/80">
            Footer
          </a>
        </nav>

        <Button href="/chatbot" variant="secondary" className="hidden md:inline-flex">
          Open chat
        </Button>
      </header>

      <HeroSection />

      <section id="features" className="relative z-10 mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-10 lg:pb-24">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need for a focused AI web workflow."
          description="A clean, premium layout designed around one job: getting people from a prompt to a useful answer as quickly as possible."
        />

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Search"
            description="Find current information quickly and keep your workflow moving with minimal friction."
          />
          <FeatureCard
            title="Extract"
            description="Pull out relevant facts, names, and details without unnecessary noise or clutter."
          />
          <FeatureCard
            title="Research"
            description="Use the same interface for deeper, structured exploration across multiple sources."
          />
        </div>
      </section>

      <section id="examples" className="relative z-10 mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-10 lg:pb-24">
        <div className="rounded-[2rem] border border-white/70 bg-white/40 px-6 py-8 shadow-[0_18px_50px_rgba(47,45,43,0.08)] backdrop-blur sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <SectionHeading
              eyebrow="Examples"
              title="A polished front door for the chatbot experience."
              description="The layout stays sparse and premium, with the main focus on the headline, the prompt surface, and a clear next step."
            />

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Fast", "Feels immediate"],
                ["Clean", "No clutter"],
                ["Focused", "One clear flow"],
              ].map(([title, desc]) => (
                <div
                  key={title}
                  className="rounded-[1.5rem] border border-white/70 bg-white/50 px-5 py-6 text-center shadow-sm"
                >
                  <p className="text-base font-semibold text-[#2f2d2b]">{title}</p>
                  <p className="mt-1.5 text-sm text-black/48">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer id="footer" className="relative z-10 border-t border-white/70 bg-white/25 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-12 text-sm text-black/50 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10 lg:py-14">
          <p>© 2026 Chat Assist. Secure, simple, and ready to use.</p>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-black/75">
              Features
            </a>
            <a href="#examples" className="hover:text-black/75">
              Examples
            </a>
            <Link href="/chatbot" className="hover:text-black/75">
              Chat
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
