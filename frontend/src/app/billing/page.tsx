import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";
import { UserMenu } from "@/components/UserMenu";
import { BillingPortalButton } from "@/components/BillingPortalButton";

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null; // middleware handles redirect

  const sub = await getUserSubscription(user.id);
  const isPro = sub.plan === "pro" && sub.status === "active";

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg-base)" }}>
      <header
        className="sticky top-0 z-50 border-b"
        style={{ backgroundColor: "var(--bg-base)", borderColor: "var(--border-subtle)" }}
      >
        <div className="max-w-3xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
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
          </a>
          <UserMenu email={user.email ?? ""} />
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-5 py-10">
        <div className="mb-8">
          <div
            className="inline-flex items-center gap-2 px-2.5 py-1 rounded border text-xs font-mono mb-4"
            style={{ borderColor: "var(--border-strong)", color: "var(--text-muted)" }}
          >
            <span style={{ color: "var(--accent)" }}>◆</span>
            BILLING
          </div>
          <h1 className="font-display text-2xl font-bold text-text-primary tracking-tight">
            Billing &amp; Plan
          </h1>
        </div>

        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
        >
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <div className="text-xs font-mono tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
                CURRENT PLAN
              </div>
              <div className="font-display font-bold text-2xl text-text-primary">
                {isPro ? "Pro" : "Free"}
              </div>
              {isPro && sub.currentPeriodEnd && (
                <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {sub.cancelAtPeriodEnd
                    ? `Cancels on ${sub.currentPeriodEnd.toLocaleDateString()}`
                    : `Renews on ${sub.currentPeriodEnd.toLocaleDateString()}`}
                </div>
              )}
            </div>
            <span
              className="px-2.5 py-1 rounded text-xs font-mono font-bold"
              style={{
                backgroundColor: isPro ? "rgba(16,185,129,0.12)" : "rgba(90,90,80,0.15)",
                color: isPro ? "#10B981" : "var(--text-muted)",
                border: `1px solid ${isPro ? "rgba(16,185,129,0.25)" : "var(--border-strong)"}`,
              }}
            >
              {isPro ? "ACTIVE" : "FREE"}
            </span>
          </div>

          {isPro ? (
            <BillingPortalButton />
          ) : (
            <a
              href="/pricing"
              className="inline-block px-4 py-2 rounded-lg text-xs font-mono font-bold tracking-widest"
              style={{ backgroundColor: "var(--accent)", color: "#0B0B0A" }}
            >
              UPGRADE TO PRO →
            </a>
          )}
        </div>
      </main>
    </div>
  );
}
