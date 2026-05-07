import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "@/components/UserMenu";
import type { LeadInput, QualificationResult } from "@/lib/types";

interface LeadResultRow {
  id: string;
  created_at: string;
  company_name: string;
  contact_name: string | null;
  lead_input: LeadInput;
  qualification_result: QualificationResult;
  score: number;
  grade: string;
}

const gradeConfig: Record<string, { color: string; label: string }> = {
  A: { color: "#10B981", label: "Hot Lead" },
  B: { color: "#3B82F6", label: "Good Lead" },
  C: { color: "#F59E0B", label: "Marginal" },
  D: { color: "#F97316", label: "Weak Lead" },
  F: { color: "#EF4444", label: "Disqualify" },
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-CA", { dateStyle: "medium" }).format(
    new Date(iso)
  );
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rows, error } = await supabase
    .from("lead_results")
    .select("*")
    .order("created_at", { ascending: false });

  const results: LeadResultRow[] = (rows as LeadResultRow[]) ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-base">
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b border-border-subtle"
        style={{ backgroundColor: "var(--bg-base)" }}
      >
        <div className="max-w-3xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
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
          </div>
          <UserMenu email={user?.email ?? ""} />
        </div>
      </header>

      {/* Hero */}
      <div className="border-b border-border-subtle" style={{ backgroundColor: "var(--bg-surface)" }}>
        <div className="max-w-3xl mx-auto px-5 py-8">
          <div
            className="inline-flex items-center gap-2 px-2.5 py-1 rounded border text-xs font-mono mb-4"
            style={{
              borderColor: "var(--border-strong)",
              color: "var(--text-muted)",
            }}
          >
            <span style={{ color: "var(--accent)" }}>◆</span>
            QUALIFICATION HISTORY
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-primary leading-tight tracking-tight">
            Your past leads
          </h1>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-5 py-8">
        {error && (
          <div
            className="text-sm px-4 py-3 rounded-lg border mb-6"
            style={{
              backgroundColor: "rgba(239,68,68,0.08)",
              borderColor: "rgba(239,68,68,0.25)",
              color: "#EF4444",
            }}
          >
            Failed to load history. Please refresh the page.
          </div>
        )}

        {results.length === 0 && !error ? (
          <div
            className="rounded-2xl border p-12 text-center"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <p className="font-display font-bold text-text-primary mb-2">
              No leads qualified yet
            </p>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              Submit your first lead to see results here.
            </p>
            <a
              href="/"
              className="inline-block px-5 py-2.5 rounded-lg font-mono text-xs tracking-widest font-bold"
              style={{ backgroundColor: "var(--accent)", color: "#0B0B0A" }}
            >
              QUALIFY A LEAD
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {results.map((row) => {
              const cfg = gradeConfig[row.grade] ?? gradeConfig["F"];
              const qr = row.qualification_result;
              return (
                <details
                  key={row.id}
                  className="rounded-2xl border overflow-hidden group"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-subtle)",
                  }}
                >
                  <summary
                    className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none list-none"
                    style={{ WebkitUserSelect: "none" }}
                  >
                    {/* Grade badge */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-display font-bold text-sm"
                      style={{ backgroundColor: cfg.color, color: "#0B0B0A" }}
                    >
                      {row.grade}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-display font-bold text-text-primary text-sm truncate">
                          {row.company_name}
                        </span>
                        {row.contact_name && (
                          <span
                            className="text-xs truncate"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {row.contact_name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs font-mono" style={{ color: cfg.color }}>
                          {row.score}/100
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {cfg.label}
                        </span>
                        <span
                          className="text-xs font-mono"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {formatDate(row.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Expand chevron */}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      className="flex-shrink-0 transition-transform group-open:rotate-180"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <path
                        d="M3 5l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </summary>

                  {/* Expanded detail */}
                  <div
                    className="px-5 pb-5 border-t"
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    {/* Summary */}
                    {qr.summary && (
                      <p
                        className="text-sm leading-relaxed mt-4 mb-4"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {qr.summary}
                      </p>
                    )}

                    {/* Disqualification reason */}
                    {qr.disqualified && qr.disqualifyReason && (
                      <div
                        className="text-sm px-3 py-2.5 rounded-lg border mb-4"
                        style={{
                          backgroundColor: "rgba(239,68,68,0.08)",
                          borderColor: "rgba(239,68,68,0.25)",
                          color: "#EF4444",
                        }}
                      >
                        {qr.disqualifyReason}
                      </div>
                    )}

                    {/* Strengths & Concerns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      {qr.strengths?.length > 0 && (
                        <div>
                          <p
                            className="text-xs font-mono tracking-widest mb-2"
                            style={{ color: "#10B981" }}
                          >
                            STRENGTHS
                          </p>
                          <ul className="flex flex-col gap-1.5">
                            {qr.strengths.map((s, i) => (
                              <li
                                key={i}
                                className="text-xs flex items-start gap-1.5"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                <span style={{ color: "#10B981" }}>+</span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {qr.concerns?.length > 0 && (
                        <div>
                          <p
                            className="text-xs font-mono tracking-widest mb-2"
                            style={{ color: "#F97316" }}
                          >
                            CONCERNS
                          </p>
                          <ul className="flex flex-col gap-1.5">
                            {qr.concerns.map((c, i) => (
                              <li
                                key={i}
                                className="text-xs flex items-start gap-1.5"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                <span style={{ color: "#F97316" }}>−</span>
                                {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Next action */}
                    {qr.nextAction && (
                      <div
                        className="rounded-lg border px-3 py-2.5 text-xs"
                        style={{
                          borderColor: "var(--border-strong)",
                          backgroundColor: "var(--bg-base)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        <span
                          className="font-mono tracking-widest mr-2"
                          style={{ color: "var(--accent)" }}
                        >
                          NEXT →
                        </span>
                        {qr.nextAction}
                      </div>
                    )}
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </main>

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
