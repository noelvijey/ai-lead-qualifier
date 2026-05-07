"use client";

import { useState } from "react";

export function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const body = await res.json();
      if (!res.ok || !body.url) {
        throw new Error(body.error ?? "Failed to start checkout");
      }
      window.location.href = body.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-xs text-center" style={{ color: "var(--danger, #EF4444)" }}>
          {error}
        </p>
      )}
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full py-2.5 rounded-lg text-xs font-mono font-bold tracking-widest transition-opacity"
        style={{
          backgroundColor: "var(--accent)",
          color: "#0B0B0A",
          opacity: loading ? 0.6 : 1,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "REDIRECTING..." : "UPGRADE TO PRO →"}
      </button>
    </div>
  );
}
