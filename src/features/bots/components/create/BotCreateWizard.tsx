"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Bot, Check, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import type { BotFormData } from "@/features/bots/types/bot-config";
import { defaultBotFormData } from "@/features/bots/types/bot-config";
import BotBrandingFields from "../edit/BotBrandingFields";
import BotGeneralFields, {
  type BotFieldUpdater,
} from "../edit/BotGeneralFields";
import BotKnowledgeFields from "../edit/BotKnowledgeFields";
import BotPreview from "../preview/BotPreview";
import { useAuth } from "@/features/auth/components/AuthProvider";
import BillingLimitModal from "@/features/billing/components/BillingLimitModal";
import type { BillingSummary } from "@/features/billing/types/billing";

const steps = [
  { label: "General", description: "Identity & destination" },
  { label: "Knowledge", description: "Training content" },
  { label: "Branding", description: "Widget appearance" },
  { label: "Review", description: "Ready to publish" },
];

export default function BotCreateWizard() {
  const router = useRouter();
  const { session } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<BotFormData>(defaultBotFormData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [billingLimitMessage, setBillingLimitMessage] = useState("");
  const [checkingBilling, setCheckingBilling] = useState(true);
  const [createBlocked, setCreateBlocked] = useState(false);

  const update: BotFieldUpdater = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  useEffect(() => {
    let active = true;

    async function checkBillingLimit() {
      console.log("[COMPONENT] BotCreateWizard checkBillingLimit called");

      if (!session?.access_token) {
        setCheckingBilling(false);
        return;
      }

      try {
        const response = await fetch("/api/v1/me/billing", {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const payload = (await response.json()) as {
          data?: BillingSummary;
          error?: string;
        };

        if (!response.ok) {
          throw new Error(payload.error || "Failed to check billing limit");
        }

        const summary = payload.data;

        if (
          summary &&
          summary.profile.plan !== "paid" &&
          summary.botCreationLimitReached
        ) {
          const message =
            "Your free plan allows only 1 chatbot. Upgrade to create more bots.";

          if (active) {
            setCreateBlocked(true);
            setBillingLimitMessage(message);
          }
        }
      } catch (error) {
        console.error(
          "[COMPONENT] BotCreateWizard checkBillingLimit failed:",
          error,
        );
      } finally {
        if (active) {
          setCheckingBilling(false);
        }
      }
    }

    void checkBillingLimit();

    return () => {
      active = false;
    };
  }, [session?.access_token]);

  const valid = step !== 0 || Boolean(form.name.trim());

  async function create() {
    if (createBlocked) {
      setBillingLimitMessage(
        "Your free plan allows only 1 chatbot. Upgrade to create more bots.",
      );
      return;
    }

    if (!session?.access_token) {
      throw new Error("Your session has expired. Please sign in again.");
    }

    const response = await fetch("/api/v1/me/bots", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(form),
    });

    const body = (await response.json()) as {
      data?: {
        bot?: {
          refId?: string;
        };
      };
      error?: string;
      code?: string;
    };

    if (!response.ok) {
      if (
        body.code === "BOT_LIMIT_REACHED" ||
        body.code === "ACTIVE_BOT_LIMIT_REACHED" ||
        body.code === "BILLING_LIMIT_REACHED"
      ) {
        setCreateBlocked(true);
        setBillingLimitMessage(
          body.error ||
            "Your free plan allows only 1 chatbot. Upgrade to create more bots.",
        );

        return;
      }

      throw new Error(body.error || "Unable to create bot");
    }

    const botRef = body.data?.bot?.refId;

    if (!botRef) {
      throw new Error("Bot was created, but the bot reference was missing.");
    }

    router.replace(`/dashboard/bots/${botRef}`);
  }

  function continueToNextStep() {
    if (!valid) {
      setError("Bot name is required before you can continue.");
      return;
    }

    setError("");
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  if (!checkingBilling && createBlocked) {
    return (
      <>
        <BillingLimitModal
          open={Boolean(billingLimitMessage)}
          message={billingLimitMessage}
          onClose={() => setBillingLimitMessage("")}
        />

        <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
          <h1 className="text-2xl font-semibold text-text-primary">
            Free plan limit reached
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-muted">
            Your free plan currently allows only 1 chatbot. You already have a
            chatbot in your account, so creating another one is disabled for
            now.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-primary px-5 py-2"
              onClick={() => router.push("/dashboard/billing")}
            >
              View billing
            </button>

            <button
              type="button"
              className="btn-secondary px-5 py-2"
              onClick={() => router.push("/dashboard/bots")}
            >
              Back to bots
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6 sm:p-8">
      <BillingLimitModal
        open={Boolean(billingLimitMessage)}
        message={billingLimitMessage}
        onClose={() => setBillingLimitMessage("")}
      />
      <header className="mb-10">
        <p className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
          <Sparkles size={16} />
          New chatbot
        </p>
        <h1 className="text-3xl font-bold text-text-primary">
          Create your AI assistant
        </h1>
        <p className="mt-2 max-w-2xl text-text-secondary">
          Add the business context and visual style that make this chatbot feel
          like part of your website.
        </p>
      </header>

      <ol className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        {steps.map((item, index) => {
          const active = index === step;
          const complete = index < step;

          return (
            <li
              key={item.label}
              className={`rounded-xl border p-3 transition-all ${active ? "border-primary/40 bg-primary/10" : complete ? "border-primary/20 bg-primary/5" : "border-border bg-surface"}`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${active ? "bg-primary text-white" : complete ? "bg-primary/20 text-primary" : "bg-surface-elevated text-text-muted"}`}
                >
                  {complete ? <Check size={14} /> : index + 1}
                </span>
                <span
                  className={`text-sm font-semibold ${active ? "text-text-primary" : "text-text-secondary"}`}
                >
                  {item.label}
                </span>
              </div>
              <p className="mt-1 hidden text-xs text-text-muted sm:block">
                {item.description}
              </p>
            </li>
          );
        })}
      </ol>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="card">
          {step === 0 && <BotGeneralFields form={form} update={update} />}
          {step === 1 && <BotKnowledgeFields form={form} update={update} />}
          {step === 2 && <BotBrandingFields form={form} update={update} />}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Bot size={20} />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">
                    Ready to create {form.name || "your chatbot"}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-text-muted">
                    Your chatbot will be created as active. You can edit its
                    knowledge base, colors, and embed settings any time.
                  </p>
                </div>
              </div>

              <dl className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
                {[
                  ["Name", form.name || "Not set"],
                  ["Website", form.websiteUrl || "Not set"],
                  [
                    "Knowledge base",
                    `${form.knowledgeBase.length.toLocaleString()} characters`,
                  ],
                  [
                    "Widget position",
                    form.position === "bottom-left"
                      ? "Bottom left"
                      : "Bottom right",
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <dt className="text-text-muted">{label}</dt>
                    <dd className="break-all font-medium text-text-primary">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              disabled={step === 0}
            >
              <ArrowLeft size={16} />
              Back
            </Button>

            {step < steps.length - 1 ? (
              <Button type="button" onClick={continueToNextStep}>
                Continue
                <ArrowRight size={16} />
              </Button>
            ) : (
              <Button
                type="button"
                isLoading={saving}
                onClick={async () => {
                  setSaving(true);
                  setError("");
                  try {
                    await create();
                  } catch (reason) {
                    setError(
                      reason instanceof Error
                        ? reason.message
                        : "Unable to create bot",
                    );
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                <Bot size={16} />
                Create Bot
              </Button>
            )}
          </div>
        </section>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-text-primary">Live Preview</h2>
            <span className="text-xs text-text-muted">Widget</span>
          </div>
          <BotPreview config={form} />
          <p className="mt-3 text-xs leading-relaxed text-text-muted">
            This preview reflects your selected colors, bot name, icon, and
            welcome message.
          </p>
        </aside>
      </div>
    </div>
  );
}
