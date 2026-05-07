import type { Plan } from "@/lib/subscription";

interface Props {
  used: number;
  limit: number;
  plan: Plan;
}

export function UsageBanner({ used, limit, plan }: Props) {
  if (plan === "pro") return null;

  const remaining = Math.max(0, limit - used);
  const isExhausted = remaining === 0;

  return (
    <div
      className="rounded-xl border px-4 py-3 flex items-center justify-between gap-4 mb-6"
      style={{
        backgroundColor: isExhausted ? "rgba(239,68,68,0.08)" : "rgba(217,119,6,0.08)",
        borderColor: isExhausted ? "rgba(239,68,68,0.3)" : "rgba(217,119,6,0.25)",
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="text-xs font-mono tracking-widest flex-shrink-0"
          style={{ color: isExhausted ? "var(--danger, #EF4444)" : "var(--accent)" }}
        >
          {isExhausted ? "LIMIT REACHED" : "FREE PLAN"}
        </span>
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {isExhausted
            ? "You've used both free qualifications today. Resets at midnight UTC."
            : `${remaining} of ${limit} qualifications remaining today`}
        </span>
      </div>
      <a
        href="/pricing"
        className="flex-shrink-0 text-xs font-mono font-bold tracking-widest px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80"
        style={{ backgroundColor: "var(--accent)", color: "#0B0B0A" }}
      >
        UPGRADE →
      </a>
    </div>
  );
}
