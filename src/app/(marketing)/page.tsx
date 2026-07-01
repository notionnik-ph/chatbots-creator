"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle,
  Code2,
  Globe,
  MessageSquare,
  Shield,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import MarketingNavbar from "@/components/layout/MarketingNavbar";
import { useAuth } from "@/features/auth/components/AuthProvider";

console.log("[PAGE] MarketingPage loaded");

const features = [
  {
    icon: Zap,
    color: "from-yellow-500 to-orange-400",
    title: "Instant Deploy",
    description: "Embed your chatbot on any website with one small script. No backend setup needed.",
  },
  {
    icon: MessageSquare,
    color: "from-blue-500 to-cyan-400",
    title: "Smart Conversations",
    description: "Use AI-assisted answers that understand context and respond naturally to your visitors.",
  },
  {
    icon: BarChart3,
    color: "from-green-500 to-emerald-400",
    title: "Conversation History",
    description: "Review visitor conversations and improve your bot from one owner-safe dashboard.",
  },
  {
    icon: Shield,
    color: "from-purple-500 to-violet-400",
    title: "Owner-Safe APIs",
    description: "Your bots and knowledge base stay protected behind authenticated user and admin APIs.",
  },
  {
    icon: Code2,
    color: "from-pink-500 to-rose-400",
    title: "Knowledge Training",
    description: "Give every chatbot a focused knowledge base for FAQs, policies, services, and products.",
  },
  {
    icon: Globe,
    color: "from-cyan-500 to-blue-400",
    title: "Works Anywhere",
    description: "Use the generated embed snippet on Wix, WordPress, Webflow, or a custom website.",
  },
];

const pricing = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    color: "border-border",
    features: ["1 chatbot", "Website embed", "Knowledge base", "Conversation history"],
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    color: "border-primary shadow-glow",
    badge: "Most Popular",
    features: ["10 chatbots", "Advanced branding", "Priority support", "More usage capacity", "Custom knowledge"],
  },
  {
    name: "Enterprise",
    price: "$99",
    period: "/mo",
    color: "border-border",
    features: ["Unlimited chatbots", "High-volume usage", "Full analytics suite", "Dedicated support", "White-label options"],
  },
];

export default function MarketingPage() {
  console.log("[PAGE] MarketingPage rendering");
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, router, user]);

  if (loading) return null;

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-text-primary">
      <MarketingNavbar />

      <main>
        <section className="relative overflow-hidden px-4 pb-24 pt-32 text-center">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="pointer-events-none absolute left-1/2 top-40 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative mx-auto max-w-4xl animate-fade-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles size={14} />
              Powered by advanced AI
            </div>

            <h1 className="mb-6 text-5xl font-extrabold leading-tight text-text-primary md:text-7xl">
              Build AI Chatbots
              <span className="block bg-gradient-to-r from-primary via-accent-cyan to-violet-500 bg-clip-text text-transparent">
                That Actually Work
              </span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg text-text-secondary sm:text-xl">
              Deploy intelligent chatbots on your website in minutes. Train with your own data,
              customize the experience, and give every visitor a faster answer.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup" className="flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-white shadow-glow transition-all hover:bg-primary-hover">
                Start for Free <ArrowRight size={18} />
              </Link>
              <Link href="/login" className="flex items-center gap-2 rounded-xl border border-border bg-surface-elevated px-8 py-4 text-base font-semibold text-text-primary transition-all hover:border-border-hover">
                Log In to Dashboard
              </Link>
            </div>
            <p className="mt-4 text-sm text-text-muted">No credit card required · Free plan available</p>
          </div>
        </section>

        <section id="features" className="px-4 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold text-text-primary">Everything you need</h2>
              <p className="mx-auto max-w-xl text-lg text-text-secondary">
                From creation to deployment, Chatbot Creator handles the technical parts so you can focus on your business.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, color, title, description }) => {
                console.log("[PAGE] Rendering feature:", title);
                return (
                  <article key={title} className="card group hover:-translate-y-0.5 hover:shadow-lg">
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${color} shadow-md`}>
                      <Icon size={22} className="text-white" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-text-primary">{title}</h3>
                    <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="pricing" className="px-4 py-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold text-text-primary">Simple, transparent pricing</h2>
              <p className="text-lg text-text-secondary">Start free, then scale when your business needs more.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {pricing.map((plan) => (
                <article key={plan.name} className={`relative rounded-2xl border-2 ${plan.color} bg-surface-elevated p-8`}>
                  {plan.badge && (
                    <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-white">
                      {plan.badge}
                    </span>
                  )}
                  <h3 className="mb-1 text-lg font-bold text-text-primary">{plan.name}</h3>
                  <div className="mb-6 flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-text-primary">{plan.price}</span>
                    <span className="mb-1 text-text-muted">{plan.period}</span>
                  </div>
                  <ul className="mb-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-text-secondary">
                        <CheckCircle size={16} className="shrink-0 text-green-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup" className="block rounded-xl bg-primary py-3 text-center text-sm font-semibold text-white transition-all hover:bg-primary-hover">
                    Get Started
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 flex justify-center gap-1">
              {Array.from({ length: 5 }, (_, index) => (
                <Star key={index} size={20} className="fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <blockquote className="mb-4 text-xl italic text-text-secondary">
              “A clean dashboard and a ready-to-paste embed snippet make the setup feel straightforward.”
            </blockquote>
            <p className="text-sm text-text-muted">Built for practical website automation.</p>
          </div>
        </section>

        <section className="px-4 py-24">
          <div className="mx-auto max-w-2xl rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/20 via-accent-cyan/10 to-violet-500/20 p-10 text-center sm:p-12">
            <h2 className="mb-4 text-4xl font-bold text-text-primary">Ready to get started?</h2>
            <p className="mb-8 text-text-secondary">Create a chatbot, add your knowledge base, and publish it to your website.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-white shadow-glow transition-all hover:bg-primary-hover">
              Create Your Free Account <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <footer id="about" className="border-t border-border px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent-cyan text-white">
                  <Bot size={16} />
                </span>
                <span className="font-bold text-text-primary">Chatbot Creator</span>
              </div>
              <p className="text-sm leading-relaxed text-text-muted">
                Build and deploy AI chatbots in minutes, without changing how your website already works.
              </p>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "Dashboard", "Embed widget"] },
              { title: "Company", links: ["About", "Roadmap", "Support", "Contact"] },
              { title: "Legal", links: ["Privacy Policy", "Terms of Service", "Security", "Cookie Policy"] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h3 className="mb-4 font-semibold text-text-primary">{title}</h3>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-text-muted transition-colors hover:text-text-secondary">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
            <p className="text-sm text-text-muted">© 2026 Chatbot Creator. All rights reserved.</p>
            <div className="flex items-center gap-4">
              {["Twitter", "LinkedIn", "GitHub", "Discord"].map((network) => (
                <a key={network} href="#" className="text-sm text-text-muted transition-colors hover:text-text-secondary">{network}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
