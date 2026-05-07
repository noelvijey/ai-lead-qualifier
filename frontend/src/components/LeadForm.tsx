"use client";

import { useState } from "react";
import { useLeadQualification } from "@/hooks/useLeadQualification";
import { ResultCard } from "./ResultCard";
import { LoadingSpinner } from "./LoadingSpinner";
import type { LeadInput } from "@/lib/types";

const defaultValues: LeadInput = {
  companyName: "",
  contactName: "",
  contactEmail: "",
  industry: "",
  projectType: "",
  projectDescription: "",
  estimatedBudget: "",
  decisionTimeline: "",
  projectDurationEstimate: "",
  decisionMakerAccess: false,
  stakeholderCount: 1,
  painPoints: "",
  currentSolution: "",
  desiredOutcome: "",
  previousAgencyExperience: false,
  leadSource: "",
  notes: "",
};

// ─── Primitive field components ───────────────────────────────────────────────

const inputStyle = {
  backgroundColor: "var(--bg-elevated)",
  borderColor: "var(--border-strong)",
  color: "var(--text-primary)",
} as const;

const inputClass =
  "w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-all placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]";

const selectClass =
  "w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] cursor-pointer";

const textareaClass =
  "w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-all resize-none placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-mono tracking-widest" style={{ color: "var(--text-muted)" }}>
        {label.toUpperCase()}
        {required && <span className="ml-1" style={{ color: "var(--accent)" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span
        className="w-6 h-6 rounded flex items-center justify-center text-xs font-mono font-bold flex-shrink-0"
        style={{
          backgroundColor: "rgba(217,119,6,0.12)",
          color: "var(--accent)",
          border: "1px solid rgba(217,119,6,0.25)",
        }}
      >
        {number}
      </span>
      <h2 className="font-display font-bold text-sm tracking-tight" style={{ color: "var(--text-primary)" }}>
        {title}
      </h2>
      <div className="flex-1 h-px" style={{ backgroundColor: "var(--border)" }} />
    </div>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group mt-0.5">
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className="w-4 h-4 rounded border-2 flex items-center justify-center transition-colors"
          style={{
            backgroundColor: checked ? "var(--accent)" : "var(--bg-elevated)",
            borderColor: checked ? "var(--accent)" : "var(--border-strong)",
          }}
        >
          {checked && (
            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
              <path d="M1 3L3 5L7 1" stroke="#0B0B0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>
      <span className="text-sm leading-snug" style={{ color: "var(--text-secondary)" }}>
        {label}
      </span>
    </label>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function LeadForm() {
  const [form, setForm] = useState<LeadInput>(defaultValues);
  const { state, qualify, reset } = useLeadQualification();

  function set<K extends keyof LeadInput>(key: K, value: LeadInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    qualify(form);
  }

  if (state.status === "done") {
    return <ResultCard result={state.result} onReset={reset} />;
  }

  if (state.status === "submitting" || state.status === "running") {
    return (
      <LoadingSpinner
        message={
          state.status === "submitting"
            ? "Sending to AI..."
            : "Analyzing lead... this takes about 5–10 seconds"
        }
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error banner */}
      {state.status === "error" && (
        <div
          className="rounded-xl border px-4 py-3 text-sm animate-fade-up"
          style={{
            backgroundColor: "rgba(239,68,68,0.08)",
            borderColor: "rgba(239,68,68,0.3)",
            color: "#FCA5A5",
          }}
        >
          <span className="font-semibold">Error: </span>
          {state.message}
        </div>
      )}

      {/* 01 · Contact Info */}
      <section
        className="rounded-2xl border p-5 animate-fade-up"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border)",
          animationDelay: "0ms",
        }}
      >
        <SectionHeader number="01" title="Contact Info" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Company Name" required>
            <input
              className={inputClass}
              style={inputStyle}
              value={form.companyName}
              onChange={(e) => set("companyName", e.target.value)}
              placeholder="Acme Corp"
              required
            />
          </Field>
          <Field label="Contact Name" required>
            <input
              className={inputClass}
              style={inputStyle}
              value={form.contactName}
              onChange={(e) => set("contactName", e.target.value)}
              placeholder="Jane Smith"
              required
            />
          </Field>
          <Field label="Contact Email" required>
            <input
              className={inputClass}
              style={inputStyle}
              type="email"
              value={form.contactEmail}
              onChange={(e) => set("contactEmail", e.target.value)}
              placeholder="jane@acme.com"
              required
            />
          </Field>
          <Field label="Industry" required>
            <input
              className={inputClass}
              style={inputStyle}
              value={form.industry}
              onChange={(e) => set("industry", e.target.value)}
              placeholder="E-commerce, SaaS, Healthcare..."
              required
            />
          </Field>
        </div>
      </section>

      {/* 02 · Project Scope */}
      <section
        className="rounded-2xl border p-5 animate-fade-up"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border)",
          animationDelay: "60ms",
        }}
      >
        <SectionHeader number="02" title="Project Scope" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field label="Project Type" required>
            <select
              className={selectClass}
              style={inputStyle}
              value={form.projectType}
              onChange={(e) => set("projectType", e.target.value)}
              required
            >
              <option value="">Select type...</option>
              <option>Web app build</option>
              <option>AI integration</option>
              <option>Automation / workflow</option>
              <option>Consulting</option>
              <option>Ongoing retainer</option>
              <option>Other</option>
            </select>
          </Field>
          <Field label="Estimated Budget" required>
            <select
              className={selectClass}
              style={inputStyle}
              value={form.estimatedBudget}
              onChange={(e) => set("estimatedBudget", e.target.value)}
              required
            >
              <option value="">Select budget...</option>
              <option>Under $5,000</option>
              <option>$5,000–$10,000</option>
              <option>$10,000–$25,000</option>
              <option>$25,000–$50,000</option>
              <option>$50,000+</option>
              <option>Unknown</option>
            </select>
          </Field>
          <Field label="Decision Timeline" required>
            <select
              className={selectClass}
              style={inputStyle}
              value={form.decisionTimeline}
              onChange={(e) => set("decisionTimeline", e.target.value)}
              required
            >
              <option value="">Select timeline...</option>
              <option>This month</option>
              <option>Next quarter</option>
              <option>6–12 months</option>
              <option>Just exploring</option>
            </select>
          </Field>
          <Field label="Project Duration" required>
            <select
              className={selectClass}
              style={inputStyle}
              value={form.projectDurationEstimate}
              onChange={(e) => set("projectDurationEstimate", e.target.value)}
              required
            >
              <option value="">Select duration...</option>
              <option>Under 1 month</option>
              <option>1–2 months</option>
              <option>2–4 months</option>
              <option>4–6 months</option>
              <option>6+ months</option>
              <option>Ongoing retainer</option>
            </select>
          </Field>
        </div>
        <Field label="Project Description" required>
          <textarea
            className={textareaClass}
            style={inputStyle}
            rows={3}
            value={form.projectDescription}
            onChange={(e) => set("projectDescription", e.target.value)}
            placeholder="What do they want to build or achieve?"
            required
          />
        </Field>
      </section>

      {/* 03 · Authority */}
      <section
        className="rounded-2xl border p-5 animate-fade-up"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border)",
          animationDelay: "120ms",
        }}
      >
        <SectionHeader number="03" title="Authority" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Decision Maker Access">
            <CheckboxField
              label="I'm speaking with the contract signer"
              checked={form.decisionMakerAccess}
              onChange={(v) => set("decisionMakerAccess", v)}
            />
          </Field>
          <Field label="Number of Stakeholders" required>
            <input
              className={inputClass}
              style={inputStyle}
              type="number"
              min={1}
              max={20}
              value={form.stakeholderCount}
              onChange={(e) => set("stakeholderCount", parseInt(e.target.value) || 1)}
              required
            />
          </Field>
        </div>
      </section>

      {/* 04 · Pain & Fit */}
      <section
        className="rounded-2xl border p-5 animate-fade-up"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border)",
          animationDelay: "180ms",
        }}
      >
        <SectionHeader number="04" title="Pain & Fit" />
        <div className="space-y-4">
          <Field label="Pain Points" required>
            <textarea
              className={textareaClass}
              style={inputStyle}
              rows={2}
              value={form.painPoints}
              onChange={(e) => set("painPoints", e.target.value)}
              placeholder="What problem are they trying to solve?"
              required
            />
          </Field>
          <Field label="Current Solution" required>
            <input
              className={inputClass}
              style={inputStyle}
              value={form.currentSolution}
              onChange={(e) => set("currentSolution", e.target.value)}
              placeholder="What are they using now? (e.g. Excel, manual process)"
              required
            />
          </Field>
          <Field label="Desired Outcome" required>
            <textarea
              className={textareaClass}
              style={inputStyle}
              rows={2}
              value={form.desiredOutcome}
              onChange={(e) => set("desiredOutcome", e.target.value)}
              placeholder="What does success look like to them?"
              required
            />
          </Field>
          <Field label="Previous Agency Experience">
            <CheckboxField
              label="They've worked with an agency before"
              checked={form.previousAgencyExperience}
              onChange={(v) => set("previousAgencyExperience", v)}
            />
          </Field>
        </div>
      </section>

      {/* 05 · Lead Source */}
      <section
        className="rounded-2xl border p-5 animate-fade-up"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border)",
          animationDelay: "240ms",
        }}
      >
        <SectionHeader number="05" title="Lead Source" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Field label="Source" required>
            <select
              className={selectClass}
              style={inputStyle}
              value={form.leadSource}
              onChange={(e) => set("leadSource", e.target.value)}
              required
            >
              <option value="">Select source...</option>
              <option>Inbound form</option>
              <option>Referral</option>
              <option>Cold outreach</option>
              <option>LinkedIn</option>
              <option>Conference / event</option>
              <option>Other</option>
            </select>
          </Field>
        </div>
        <Field label="Additional Notes">
          <textarea
            className={textareaClass}
            style={inputStyle}
            rows={2}
            value={form.notes ?? ""}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Anything else the sales rep wants to flag..."
          />
        </Field>
      </section>

      {/* Submit */}
      <button
        type="submit"
        className="w-full rounded-xl py-4 text-sm font-display font-bold tracking-wide transition-all animate-fade-up"
        style={{
          backgroundColor: "var(--accent)",
          color: "#0B0B0A",
          animationDelay: "300ms",
          boxShadow: "0 0 0 0 rgba(217,119,6,0)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--accent-light)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(217,119,6,0.35)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--accent)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 0 0 rgba(217,119,6,0)";
        }}
      >
        Analyze Lead
      </button>
    </form>
  );
}
