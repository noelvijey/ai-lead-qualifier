"use client";

export function LoadingSpinner({ message }: { message?: string }) {
  const isAnalyzing = message?.toLowerCase().includes("analyz");

  return (
    <div className="animate-scale-in">
      <div
        className="rounded-2xl border p-10 flex flex-col items-center gap-6"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border)",
        }}
      >
        {/* Animated dots */}
        <div className="flex items-center gap-2.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full animate-pulse-dot"
              style={{
                backgroundColor: "var(--accent)",
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>

        <div className="text-center space-y-2">
          <p
            className="font-display font-bold text-lg"
            style={{ color: "var(--text-primary)" }}
          >
            {isAnalyzing ? "Analyzing with Claude" : "Sending to AI"}
          </p>
          {message && (
            <p className="text-sm font-mono" style={{ color: "var(--text-muted)" }}>
              {isAnalyzing
                ? "Evaluating BANT signals and ICP fit..."
                : message}
            </p>
          )}
        </div>

        {/* Subtle progress bar */}
        {isAnalyzing && (
          <div
            className="w-48 h-px rounded-full overflow-hidden"
            style={{ backgroundColor: "var(--border-strong)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                backgroundColor: "var(--accent)",
                animation: "progressBar 8s ease-in-out forwards",
                width: "0%",
              }}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes progressBar {
          0%   { width: 0%; }
          60%  { width: 75%; }
          90%  { width: 88%; }
          100% { width: 92%; }
        }
      `}</style>
    </div>
  );
}
