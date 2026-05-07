"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  email: string;
}

export function UserMenu({ email }: Props) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <a
        href="/pricing"
        className="text-xs font-mono tracking-widest transition-colors"
        style={{ color: "var(--text-muted)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        PRICING
      </a>

      <a
        href="/history"
        className="text-xs font-mono tracking-widest transition-colors"
        style={{ color: "var(--text-muted)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        HISTORY
      </a>

      <a
        href="/billing"
        className="text-xs font-mono tracking-widest transition-colors"
        style={{ color: "var(--text-muted)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        BILLING
      </a>

      <div className="h-4 w-px" style={{ backgroundColor: "var(--border-strong)" }} />

      <span
        className="text-xs font-mono max-w-[140px] truncate hidden sm:block"
        style={{ color: "var(--text-muted)" }}
        title={email}
      >
        {email}
      </span>

      <button
        onClick={handleLogout}
        className="text-xs font-mono tracking-widest px-2 py-1 rounded border transition-colors"
        style={{
          borderColor: "var(--border-strong)",
          color: "var(--text-muted)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--text-primary)";
          e.currentTarget.style.borderColor = "var(--text-muted)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--text-muted)";
          e.currentTarget.style.borderColor = "var(--border-strong)";
        }}
      >
        LOG OUT
      </button>
    </div>
  );
}
