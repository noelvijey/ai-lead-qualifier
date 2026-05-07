"use client";

import { useState } from "react";

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const body = await res.json();
    if (body.url) {
      window.location.href = body.url;
    } else {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="px-4 py-2 rounded-lg border text-xs font-mono tracking-widest transition-colors"
      style={{
        borderColor: "var(--border-strong)",
        color: "var(--text-muted)",
        opacity: loading ? 0.6 : 1,
        cursor: loading ? "not-allowed" : "pointer",
      }}
      onMouseEnter={(e) => {
        if (!loading) e.currentTarget.style.color = "var(--text-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--text-muted)";
      }}
    >
      {loading ? "OPENING PORTAL..." : "MANAGE BILLING →"}
    </button>
  );
}
