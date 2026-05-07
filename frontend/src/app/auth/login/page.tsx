"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // If email confirmation is disabled, session is returned immediately
      if (data.session) {
        router.push("/");
        router.refresh();
      } else {
        // Email confirmation required — show message
        setSignupSuccess(true);
        setLoading(false);
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    }
  }

  function toggleMode() {
    setMode((m) => (m === "signin" ? "signup" : "signin"));
    setError(null);
    setSignupSuccess(false);
  }

  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--bg-base)",
    border: "1px solid var(--border-subtle)",
    color: "var(--text-primary)",
    borderRadius: "0.5rem",
    padding: "0.625rem 0.75rem",
    fontSize: "0.875rem",
    width: "100%",
    outline: "none",
    transition: "border-color 0.15s",
    fontFamily: "inherit",
  };

  if (signupSuccess) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: "var(--bg-base)" }}
      >
        <div
          className="w-full max-w-sm rounded-2xl border p-8 text-center"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "var(--success)", opacity: 0.15 }}
          />
          <h2 className="font-display font-bold text-text-primary text-lg mb-2">
            Check your email
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            We&apos;ve sent a confirmation link to <strong>{email}</strong>. Click it to
            activate your account and log in.
          </p>
          <button
            onClick={toggleMode}
            className="mt-6 text-xs font-mono tracking-widest"
            style={{ color: "var(--accent)" }}
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
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
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border p-8"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <h1 className="font-display font-bold text-text-primary text-xl mb-6">
            {mode === "signin" ? "Sign in to continue" : "Create your account"}
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-mono tracking-widest"
                style={{ color: "var(--text-muted)" }}
              >
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={inputStyle}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--accent)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border-subtle)")
                }
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-mono tracking-widest"
                style={{ color: "var(--text-muted)" }}
              >
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                minLength={6}
                style={inputStyle}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--accent)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border-subtle)")
                }
              />
              {mode === "signup" && (
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Minimum 6 characters
                </span>
              )}
            </div>

            {error && (
              <div
                className="text-sm px-3 py-2.5 rounded-lg border"
                style={{
                  backgroundColor: "rgba(239,68,68,0.08)",
                  borderColor: "rgba(239,68,68,0.25)",
                  color: "#EF4444",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-mono text-xs tracking-widest font-bold transition-opacity mt-1"
              style={{
                backgroundColor: "var(--accent)",
                color: "#0B0B0A",
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading
                ? mode === "signin"
                  ? "SIGNING IN..."
                  : "CREATING ACCOUNT..."
                : mode === "signin"
                ? "SIGN IN"
                : "CREATE ACCOUNT"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            {mode === "signin" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  onClick={toggleMode}
                  className="font-medium"
                  style={{ color: "var(--accent)" }}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={toggleMode}
                  className="font-medium"
                  style={{ color: "var(--accent)" }}
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
