import { LeadForm } from "@/components/LeadForm";
import { UserMenu } from "@/components/UserMenu";
import { UsageBanner } from "@/components/UsageBanner";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription, getTodayUsageCount } from "@/lib/subscription";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const subscription = user ? await getUserSubscription(user.id) : null;
  const todayCount =
    user && subscription?.plan !== "pro"
      ? await getTodayUsageCount(user.id)
      : 0;

  return (
    <div className="min-h-screen flex flex-col bg-base">
      {/* Top bar */}
      <header
        className="sticky top-0 z-50 border-b border-border-subtle"
        style={{ backgroundColor: "var(--bg-base)" }}
      >
        <div className="max-w-3xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "var(--accent)" }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <polygon points="6,1 11,3.5 11,8.5 6,11 1,8.5 1,3.5" fill="#0B0B0A" />
              </svg>
            </div>
            <span className="font-display font-bold text-text-primary text-sm tracking-tight">
              Lead Qualifier
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: "var(--success)" }}
              />
              <span className="text-xs font-mono text-text-muted tracking-widest">AI ONLINE</span>
            </div>
            {/* user! is safe — middleware guarantees auth before this page renders */}
            <UserMenu email={user?.email ?? ""} />
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="border-b border-border-subtle" style={{ backgroundColor: "var(--bg-surface)" }}>
        <div className="max-w-3xl mx-auto px-5 py-10">
          <div
            className="inline-flex items-center gap-2 px-2.5 py-1 rounded border text-xs font-mono mb-5"
            style={{
              borderColor: "var(--border-strong)",
              color: "var(--text-muted)",
            }}
          >
            <span style={{ color: "var(--accent)" }}>◆</span>
            BANT + ICP ANALYSIS · CLAUDE SONNET 4.6
          </div>
          <h1 className="font-display text-3xl sm:text-[2.6rem] font-bold text-text-primary leading-[1.1] tracking-tight mb-4">
            Qualify leads in{" "}
            <span style={{ color: "var(--accent)" }}>10 seconds.</span>
          </h1>
          <p className="text-text-secondary max-w-md leading-relaxed text-sm sm:text-base">
            Fill out the prospect details. Claude evaluates budget, authority, need,
            and timeline — returning a 0–100 score with a recommended next action.
          </p>
        </div>
      </div>

      {/* Form */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-5 py-10">
        {user && subscription && (
          <UsageBanner used={todayCount} limit={2} plan={subscription.plan} />
        )}
        <LeadForm />
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-4">
        <div className="max-w-3xl mx-auto px-5 flex items-center justify-between">
          <span className="text-xs font-mono text-text-muted">
            Powered by Claude Sonnet 4.6 via Trigger.dev
          </span>
          <span className="text-xs font-mono text-text-muted">v1.0</span>
        </div>
      </footer>
    </div>
  );
}
