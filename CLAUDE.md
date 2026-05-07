# CLAUDE.md — AI Lead Qualifier

> This file is read by Claude Code at the start of every session.
> It is the single source of truth for working in this repo.
> Keep it accurate. Update it when architecture, env vars, or key files change.

---

## Project Overview

The AI Lead Qualifier is a full-stack web application that lets an agency sales team evaluate inbound leads using AI. A user fills out a form describing a prospect (company, project scope, budget, timeline, pain points, etc.), clicks **Analyze**, and the system returns a qualification score (0–100) with a written summary and recommended next action.

**Business context**: This is an agency/services business. Leads are evaluated on whether their project is a strong fit for the agency's services, not on seat count or software budget. Key signals are scope clarity, timeline urgency, budget reality, and whether we're talking to the decision-maker.

---

## WAT Framework

This project is organized using the WAT framework for agentic work:

```
W = Workflows / Instructions   →  workflows/   folder
A = Agent                      →  Claude Code (you — no folder needed)
T = Tools / Scripts            →  tools/       folder
```

### W — Workflows (`workflows/`)
Runbooks, decision trees, and process documentation. When you need to understand HOW to do something in this project (qualify a lead, deploy, debug), read the relevant file here first.

- `lead-qualification-logic.md` — The scoring rubric and AI prompt design
- `dev-setup.md`                — Local development setup from zero
- `deployment.md`               — How to deploy backend (Trigger.dev) and frontend (Vercel)
- `troubleshooting.md`          — Known issues, error messages, and fixes

### A — Agent (Claude Code)
You are the agent. You read this file, orient yourself to the codebase, and execute tasks. You have permission to read all files, write code, and run the scripts in `tools/`. When in doubt about a process, check `workflows/` first.

### T — Tools (`tools/`)
TypeScript scripts for local development and testing. Run with `bun tools/<name>.ts` or `npx ts-node tools/<name>.ts` from the repo root.

- `test-lead.ts`        — Fire a single test lead through the Trigger.dev qualification task
- `seed-test-leads.ts`  — Run a batch of sample agency leads and print all results
- `check-env.ts`        — Verify all required environment variables are present

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Next.js Frontend (Vercel)                   │   │
│  │                                                         │   │
│  │  LeadForm ──► useLeadQualification (hook)               │   │
│  │                           │                             │   │
│  │                  POST /api/qualify                       │   │
│  │                           │                             │   │
│  │         Next.js API Route (server-side proxy)           │   │
│  └───────────────────────────┬─────────────────────────────┘   │
└──────────────────────────────┼──────────────────────────────────┘
                               │  HTTPS (Trigger.dev SDK)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      TRIGGER.DEV CLOUD                          │
│                                                                 │
│  Task: qualify-lead                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  1. Receive LeadInput payload                            │   │
│  │  2. Build qualification prompt                           │   │
│  │  3. Call Claude API (claude-sonnet-4-6)                  │   │
│  │  4. Parse AI response → QualificationResult              │   │
│  │  5. Return { score, grade, summary, nextAction, ... }    │   │
│  └─────────────────────────────────────────────────────────┘   │
└──────────────────────────────────┬──────────────────────────────┘
                                   │  Anthropic API
                                   ▼
                       ┌──────────────────────┐
                       │  Claude API           │
                       │  claude-sonnet-4-6    │
                       └──────────────────────┘
```

### Communication Flow (Detail)

1. User submits the lead form in the browser.
2. The `useLeadQualification` hook POSTs to `/api/qualify` (Next.js API route).
3. The API route (server-side, secrets stay hidden) uses the Trigger.dev SDK to trigger the `qualify-lead` task. It receives `{ id, publicAccessToken }`.
4. The API route returns `{ runId, publicAccessToken }` to the browser.
5. The browser uses `publicAccessToken` + Trigger.dev's `runs.subscribeToRun()` to watch the run until it completes.
6. When complete, the result is displayed in `ResultCard`.

**Why a server-side proxy?**
The `TRIGGER_SECRET_KEY` can trigger any task in the project — it must never reach the browser. The Next.js API route holds the secret server-side, triggers the task, and gives the browser only a short-lived `publicAccessToken` scoped to that specific run. This is Trigger.dev's recommended pattern.

---

## Lead Input Schema

Fields collected by the form. Defined in `backend/src/lib/schema.ts` (Zod) and mirrored in `frontend/src/lib/types.ts`.

```typescript
interface LeadInput {
  // Identity
  companyName: string;           // e.g. "Acme Corp"
  contactName: string;           // e.g. "Jane Smith"
  contactEmail: string;          // e.g. "jane@acme.com"
  industry: string;              // e.g. "E-commerce", "Healthcare", "Finance"

  // Project Scope (agency-specific)
  projectType: string;           // e.g. "Web app build", "AI integration", "Consulting"
  projectDescription: string;    // Free text: what do they want to build/achieve?
  estimatedBudget: string;       // e.g. "$10,000–$25,000", "Under $5,000", "Unknown"
  decisionTimeline: string;      // e.g. "This month", "Next quarter", "Just exploring"
  projectDurationEstimate: string; // e.g. "1–2 months", "6+ months", "Ongoing retainer"

  // Authority
  decisionMakerAccess: boolean;  // Are we talking to the person who signs the contract?
  stakeholderCount: number;      // How many people are involved in the decision?

  // Pain & Fit
  painPoints: string;            // What problem are they trying to solve?
  currentSolution: string;       // What are they doing now? (if anything)
  desiredOutcome: string;        // What does success look like to them?
  previousAgencyExperience: boolean; // Have they worked with an agency before?

  // Lead Source
  leadSource: string;            // e.g. "Inbound form", "Referral", "Cold outreach"
  notes?: string;                // Optional: anything else the sales rep wants to add
}
```

---

## Qualification Result Schema

```typescript
interface QualificationResult {
  score: number;             // 0–100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  summary: string;           // 2–4 sentence written summary of the lead quality
  strengths: string[];       // Bullet points of positive signals
  concerns: string[];        // Bullet points of risk factors or gaps
  nextAction: string;        // Recommended next step for the sales rep
  disqualified: boolean;     // True if lead is clearly not a fit (score < 20)
  disqualifyReason?: string; // Only present if disqualified === true
}
```

---

## Lead Qualification Criteria

The AI evaluates leads using two frameworks simultaneously. See `workflows/lead-qualification-logic.md` for the full rubric and prompt design.

### 1. BANT (Budget, Authority, Need, Timeline)
- **Budget**: Is the stated budget realistic for the project scope? Is it specific or vague?
- **Authority**: Are we speaking with the decision-maker (contract signer), or just an influencer?
- **Need**: Is the pain point real, specific, and urgent — or vague and exploratory?
- **Timeline**: Is the timeline actionable (this month = strong) or speculative (just exploring = weak)?

### 2. Agency ICP Fit
- **Project type**: Does this match the agency's service offering?
- **Scope clarity**: Is the project well-defined or too vague to quote?
- **Budget reality**: Does budget match typical project complexity?
- **Previous agency experience**: Experienced clients = smoother engagement; first-timers = more education needed.
- **Stakeholder count**: Single decision-maker = fast close; committee of 5+ = long sales cycle.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Where to get it |
|---|---|---|
| `TRIGGER_SECRET_KEY` | Trigger.dev secret key for the project | Trigger.dev dashboard → Project → API Keys |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude | console.anthropic.com |

### Frontend (`frontend/.env.local`)

| Variable | Description | Notes |
|---|---|---|
| `TRIGGER_SECRET_KEY` | Same secret key — used server-side only in the `/api/qualify` route | Never exposed to the browser bundle |
| `NEXT_PUBLIC_TRIGGER_PROJECT_REF` | Your Trigger.dev project reference (e.g. `proj_abc123`) | Trigger.dev dashboard → Project Settings |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | Same location — safe to expose (RLS enforces row-level security) |

**Never commit `.env` or `.env.local` files.** Both are in `.gitignore`.
Always update the corresponding `.example` file when adding a new variable.

---

## Development Workflow

### Prerequisites
- Node.js 20+ or Bun 1.0+
- Trigger.dev account with a project already created
- Anthropic API key

### Backend (Trigger.dev)

```bash
cd backend
npm install
cp .env.example .env          # Fill in TRIGGER_SECRET_KEY and ANTHROPIC_API_KEY
npx trigger dev               # Starts local Trigger.dev worker (connects to cloud, runs code locally)
```

### Frontend (Next.js)

```bash
cd frontend
npm install
cp .env.local.example .env.local   # Fill in variables
npm run dev                        # Starts Next.js at http://localhost:3000
```

### Running Both Together

Open two terminal tabs:
- Tab 1: `cd backend && npx trigger dev`
- Tab 2: `cd frontend && npm run dev`

Open `http://localhost:3000`, fill out the form, click Analyze.

### Testing via CLI

```bash
bun tools/test-lead.ts
# or
npx ts-node tools/test-lead.ts
```

---

## Deployment

### Backend: Trigger.dev

```bash
cd backend
npx trigger deploy
```

Compiles and deploys the task to Trigger.dev cloud. Verify it appears under **Tasks** in the dashboard.

### Frontend: Vercel via GitHub

1. Push to `main` branch on GitHub.
2. Vercel auto-detects the push and deploys.
3. Set environment variables in the Vercel project dashboard:
   - `TRIGGER_SECRET_KEY`
   - `NEXT_PUBLIC_TRIGGER_PROJECT_REF`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Important**: Set **Root Directory** to `frontend/` in Vercel project settings.
5. In Supabase dashboard → Authentication → Settings, add your Vercel production URL to **Site URL** and **Redirect URLs** (e.g. `https://your-app.vercel.app/auth/callback`).

Full runbook: `workflows/deployment.md`

---

## Key Files Reference

| File | Purpose |
|---|---|
| `backend/src/tasks/qualify-lead.ts` | Main Trigger.dev task — AI qualification logic lives here |
| `backend/src/lib/schema.ts` | Zod schemas for LeadInput and QualificationResult (source of truth) |
| `backend/src/lib/anthropic.ts` | Anthropic client singleton |
| `backend/src/lib/scorer.ts` | Parses AI text output into a structured QualificationResult |
| `backend/src/index.ts` | Barrel export — Trigger.dev discovers tasks from here |
| `frontend/src/app/api/qualify/route.ts` | Server-side proxy route that triggers Trigger.dev (auth-guarded) |
| `frontend/src/app/api/results/route.ts` | Saves a completed qualification result to Supabase |
| `frontend/src/hooks/useLeadQualification.ts` | React hook: submit → poll → return result → save to history |
| `frontend/src/components/LeadForm.tsx` | The main form component |
| `frontend/src/components/ResultCard.tsx` | Result display (score, grade, summary, next action) |
| `frontend/src/components/UserMenu.tsx` | Header user email + HISTORY link + LOG OUT button |
| `frontend/src/lib/types.ts` | TypeScript types mirroring backend schema |
| `frontend/src/lib/supabase/client.ts` | Supabase browser client (Client Components) |
| `frontend/src/lib/supabase/server.ts` | Supabase server client (Server Components, API routes) |
| `frontend/src/middleware.ts` | Session refresh + redirect unauthenticated users to /auth/login |
| `frontend/src/app/auth/login/page.tsx` | Email+password sign in / sign up page |
| `frontend/src/app/auth/callback/route.ts` | Email confirmation callback handler |
| `frontend/src/app/history/page.tsx` | User's lead qualification history (expandable result cards) |
| `workflows/lead-qualification-logic.md` | AI prompt design and scoring rubric |
| `tools/test-lead.ts` | CLI tool for firing a test qualification run |

---

## Coding Conventions

- **TypeScript strict mode** everywhere. No `any`. Enable `"strict": true` in all `tsconfig.json` files.
- **Zod schemas are the source of truth** for data shapes. Derive TypeScript types with `z.infer<typeof Schema>`. `backend/src/lib/schema.ts` is authoritative; `frontend/src/lib/types.ts` must stay in sync manually.
- **No secrets in the browser bundle.** The `TRIGGER_SECRET_KEY` is used only in `frontend/src/app/api/qualify/route.ts` (a server-side Next.js route). Never pass it to a client component or `NEXT_PUBLIC_` variable.
- **Error handling in tasks**: Wrap the Claude API call in try/catch. On failure, return a disqualified result with `disqualifyReason: "AI qualification failed — please review manually"` rather than throwing.
- **Logging**: Use `logger` from `@trigger.dev/sdk` inside Trigger.dev tasks. Use `console.log` only in `tools/` scripts and frontend components.
- **Formatting**: Prettier defaults. Run `npx prettier --write .` before committing.
- **UI components**: Use shadcn/ui as the base component library. Brand colors are configured in `tailwind.config.ts`. Grade colors: A=green, B=blue, C=yellow, D=orange, F=red.

---

## Common Gotchas

1. **Task not found after deploy**: Ensure `backend/src/index.ts` exports the task. Trigger.dev discovers tasks via the configured entry point's barrel exports.

2. **CORS errors**: The Next.js `/api/qualify` proxy eliminates CORS. Never call Trigger.dev directly from browser-side code — always go through the proxy.

3. **Public access token scope**: The `publicAccessToken` returned by `trigger()` is scoped to one specific run and expires when it completes. Do not cache or reuse it.

4. **Vercel root directory**: Set **Root Directory** to `frontend/` in Vercel project settings. If unset, Vercel tries to build the repo root and fails.

5. **Environment variable sync**: When adding a new variable, update ALL of:
   - `backend/.env` + `backend/.env.example`
   - `frontend/.env.local` + `frontend/.env.local.example`
   - Vercel dashboard (production)
   - The table in this CLAUDE.md

6. **Schema drift**: If you rename a field in `backend/src/lib/schema.ts`, update `frontend/src/lib/types.ts` and `frontend/src/components/LeadForm.tsx` in the same commit.

---

## Claude Code Guidelines

When working in this repo:

1. **Read `workflows/` first** before changing qualification logic, the AI prompt, or deployment steps.
2. **Never hardcode secrets.** Always use `process.env.VAR_NAME`. Throw a descriptive startup error if a required variable is missing.
3. **Schema first**: If changing a LeadInput or QualificationResult field, update `backend/src/lib/schema.ts` first, then propagate to the frontend.
4. **Test after task changes**: Run `bun tools/test-lead.ts` after any change to `qualify-lead.ts` or `scorer.ts`.
5. **Keep this file accurate**: If you add a key file, env var, or architectural component, update CLAUDE.md in the same session.
6. **One task, one responsibility**: Each Trigger.dev task does one thing. Factor complex logic into `backend/src/lib/` helpers.
7. **No unnecessary dependencies**: Check if the Trigger.dev SDK or Anthropic SDK already provides what you need before adding a package.
