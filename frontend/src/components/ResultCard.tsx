"use client";

import type { QualificationResult } from "@/lib/types";

const gradeConfig: Record<
  string,
  { color: string; bg: string; border: string; label: string; description: string }
> = {
  A: {
    color: "#10B981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.25)",
    label: "Hot Lead",
    description: "Prioritize immediately",
  },
  B: {
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.25)",
    label: "Good Lead",
    description: "Worth pursuing",
  },
  C: {
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.25)",
    label: "Marginal",
    description: "Proceed with caution",
  },
  D: {
    color: "#F97316",
    bg: "rgba(249,115,22,0.08)",
    border: "rgba(249,115,22,0.25)",
    label: "Weak Lead",
    description: "Low priority",
  },
  F: {
    color: "#EF4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.25)",
    label: "Disqualify",
    description: "Not a fit",
  },
};

function ScoreGauge({ score, color }: { score: number; color: string }) {
  const r = 44;
  const circumference = 2 * Math.PI * r; // ≈ 276
  const filled = (score / 100) * circumference;
  const dashoffset = circumference - filled;

  return (
    <div className="relative flex-shrink-0" style={{ width: 120, height: 120 }}>
      <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--border-strong)" strokeWidth="7" />
        {/* Arc */}
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          className="animate-arc"
          style={{ filter: `drop-shadow(0 0 5px ${color}70)` }}
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-black text-3xl leading-none" style={{ color: "var(--text-primary)" }}>
          {score}
        </span>
        <span className="text-xs font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>
          / 100
        </span>
      </div>
    </div>
  );
}

interface Props {
  result: QualificationResult;
  onReset: () => void;
}

export function ResultCard({ result, onReset }: Props) {
  const cfg = gradeConfig[result.grade] ?? gradeConfig.F;

  return (
    <div className="animate-scale-in space-y-4">
      {/* Score header */}
      <div
        className="rounded-2xl border p-5 flex items-center gap-6"
        style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
      >
        <ScoreGauge score={result.score} color={cfg.color} />

        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-md px-2.5 py-1 font-display font-bold text-2xl leading-none mb-1.5"
              style={{ color: cfg.color }}
            >
              {result.grade}
              <span
                className="text-xs font-mono font-normal px-2 py-0.5 rounded"
                style={{
                  color: cfg.color,
                  backgroundColor: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                }}
              >
                {cfg.label.toUpperCase()}
              </span>
            </div>
            <div className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
              {cfg.description}
            </div>
          </div>

          {/* Score bar */}
          <div className="space-y-1">
            <div
              className="w-full h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: "var(--border-strong)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${result.score}%`,
                  backgroundColor: cfg.color,
                  boxShadow: `0 0 8px ${cfg.color}60`,
                  transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
                }}
              />
            </div>
            <div className="flex justify-between text-xs font-mono" style={{ color: "var(--text-muted)" }}>
              <span>0</span>
              <span>100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Disqualified banner */}
      {result.disqualified && result.disqualifyReason && (
        <div
          className="rounded-xl border px-4 py-3 text-sm"
          style={{
            backgroundColor: "rgba(239,68,68,0.08)",
            borderColor: "rgba(239,68,68,0.3)",
            color: "#FCA5A5",
          }}
        >
          <span className="font-semibold">Disqualified: </span>
          {result.disqualifyReason}
        </div>
      )}

      {/* Summary */}
      <div
        className="rounded-xl border p-5"
        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
      >
        <h3 className="text-xs font-mono tracking-widest mb-2.5" style={{ color: "var(--text-muted)" }}>
          SUMMARY
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {result.summary}
        </p>
      </div>

      {/* Strengths & Concerns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className="rounded-xl border p-5"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
        >
          <h3 className="text-xs font-mono tracking-widest mb-3" style={{ color: "#10B981" }}>
            STRENGTHS
          </h3>
          <ul className="space-y-2">
            {result.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 flex-shrink-0 font-bold" style={{ color: "#10B981" }}>
                  ✓
                </span>
                <span style={{ color: "var(--text-secondary)" }}>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="rounded-xl border p-5"
          style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
        >
          <h3 className="text-xs font-mono tracking-widest mb-3" style={{ color: "#EF4444" }}>
            CONCERNS
          </h3>
          <ul className="space-y-2">
            {result.concerns.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 flex-shrink-0" style={{ color: "#EF4444" }}>
                  ▲
                </span>
                <span style={{ color: "var(--text-secondary)" }}>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Next action */}
      <div
        className="rounded-xl border px-5 py-4"
        style={{
          backgroundColor: "rgba(217,119,6,0.08)",
          borderColor: "rgba(217,119,6,0.25)",
        }}
      >
        <h3 className="text-xs font-mono tracking-widest mb-1.5" style={{ color: "var(--accent)" }}>
          RECOMMENDED NEXT ACTION
        </h3>
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {result.nextAction}
        </p>
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="w-full rounded-xl border py-3 text-xs font-mono tracking-widest transition-colors"
        style={{ borderColor: "var(--border-strong)", color: "var(--text-muted)" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--text-muted)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-strong)";
        }}
      >
        QUALIFY ANOTHER LEAD
      </button>
    </div>
  );
}
