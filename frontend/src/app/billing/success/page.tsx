import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "@/components/UserMenu";

export default async function BillingSuccessPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

      <main className="flex-1 flex items-center justify-center px-5">
        <div
          className="rounded-2xl border p-10 text-center max-w-sm w-full"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{
              backgroundColor: "rgba(16,185,129,0.12)",
              border: "1px solid rgba(16,185,129,0.25)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M4 10l4 4 8-8"
                stroke="#10B981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="font-display font-bold text-xl text-text-primary mb-2">
            You&apos;re on Pro
          </h1>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
            Your subscription is active. Qualify unlimited leads starting now.
          </p>
          <a
            href="/"
            className="inline-block w-full py-2.5 rounded-lg text-xs font-mono font-bold tracking-widest text-center"
            style={{ backgroundColor: "var(--accent)", color: "#0B0B0A" }}
          >
            START QUALIFYING →
          </a>
          <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>
            Manage your subscription in{" "}
            <a href="/billing" className="underline" style={{ color: "var(--accent)" }}>
              billing settings
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
