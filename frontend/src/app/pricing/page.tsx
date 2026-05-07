import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";
import { UserMenu } from "@/components/UserMenu";
import { CheckoutButton } from "@/components/CheckoutButton";

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const subscription = user ? await getUserSubscription(user.id) : null;
  const isPro = subscription?.plan === "pro" && subscription?.status === "active";

  const freeFeatures = ["2 qualifications per day", "Full BANT + ICP analysis", "Qualification history"];
  const proFeatures = ["Unlimited qualifications", "Full BANT + ICP analysis", "Qualification history", "Priority support"];

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
          {user && <UserMenu email={user.email ?? ""} />}
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-5 py-16">
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 px-2.5 py-1 rounded border text-xs font-mono mb-5"
            style={{ borderColor: "var(--border-strong)", color: "var(--text-muted)" }}
          >
            <span style={{ color: "var(--accent)" }}>◆</span>
            SIMPLE PRICING
          </div>
          <h1 className="font-display text-3xl font-bold text-text-primary mb-4 tracking-tight">
            Unlimited lead qualification
          </h1>
          <p className="text-text-secondary text-sm max-w-md mx-auto leading-relaxed">
            Free plan covers 2 leads per day. Upgrade to Pro for unlimited qualifications.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {/* Free tier */}
          <div
            className="rounded-2xl border p-6"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
          >
            <div className="text-xs font-mono tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
              FREE
            </div>
            <div className="font-display font-bold text-3xl text-text-primary mb-1">$0</div>
            <div className="text-xs font-mono mb-6" style={{ color: "var(--text-muted)" }}>forever</div>
            <ul className="space-y-2 mb-6">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <span style={{ color: "#10B981" }}>✓</span> {f}
                </li>
              ))}
            </ul>
            <div
              className="w-full py-2.5 rounded-lg border text-xs font-mono tracking-widest text-center"
              style={{ borderColor: "var(--border-strong)", color: "var(--text-muted)" }}
            >
              {isPro ? "PREVIOUS PLAN" : "CURRENT PLAN"}
            </div>
          </div>

          {/* Pro tier */}
          <div
            className="rounded-2xl border p-6"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: isPro ? "var(--accent)" : "rgba(217,119,6,0.4)",
            }}
          >
            <div className="text-xs font-mono tracking-widest mb-4" style={{ color: "var(--accent)" }}>
              PRO
            </div>
            <div className="font-display font-bold text-3xl text-text-primary mb-1">$29</div>
            <div className="text-xs font-mono mb-6" style={{ color: "var(--text-muted)" }}>per month</div>
            <ul className="space-y-2 mb-6">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <span style={{ color: "var(--accent)" }}>✓</span> {f}
                </li>
              ))}
            </ul>
            {isPro ? (
              <div
                className="w-full py-2.5 rounded-lg text-xs font-mono tracking-widest text-center font-bold"
                style={{ backgroundColor: "var(--accent)", color: "#0B0B0A" }}
              >
                CURRENT PLAN
              </div>
            ) : (
              <CheckoutButton />
            )}
          </div>
        </div>
      </main>

      <footer className="border-t py-4" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="max-w-3xl mx-auto px-5">
          <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
            Payments secured by Stripe
          </span>
        </div>
      </footer>
    </div>
  );
}
