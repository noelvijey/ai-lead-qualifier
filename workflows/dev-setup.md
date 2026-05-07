# Local Development Setup

Set up the full AI Lead Qualifier stack locally in about 10 minutes.

---

## Prerequisites

- Node.js 20+ or Bun 1.0+ (`node --version` / `bun --version`)
- A Trigger.dev account with a project already created
- An Anthropic API key (console.anthropic.com)
- Git

---

## Step 1: Clone and open the repo

```bash
git clone <your-repo-url>
cd "Demo Lead Qualifier"
```

---

## Step 2: Set up the backend (Trigger.dev)

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` and fill in:
- `TRIGGER_SECRET_KEY` — from Trigger.dev dashboard → Project → API Keys → Secret key
- `ANTHROPIC_API_KEY` — from console.anthropic.com

Start the local Trigger.dev worker:

```bash
npx trigger dev
```

The worker connects to Trigger.dev cloud but runs your task code locally. You'll see a URL in the terminal — open it to view runs in the Trigger.dev dashboard.

---

## Step 3: Set up the frontend (Next.js)

Open a new terminal tab:

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

Edit `frontend/.env.local` and fill in:
- `TRIGGER_SECRET_KEY` — same secret key as backend (used server-side only)
- `NEXT_PUBLIC_TRIGGER_PROJECT_REF` — from Trigger.dev dashboard → Project Settings (e.g. `proj_abc123`)

Start the Next.js dev server:

```bash
npm run dev
```

---

## Step 4: Test the full flow

1. Open `http://localhost:3000`
2. Fill in the lead form with test data
3. Click **Analyze**
4. Watch the result appear in the Trigger.dev dashboard and on screen

Alternatively, test via CLI without the UI:

```bash
# From repo root
bun tools/test-lead.ts
```

---

## Step 5: Verify environment variables

```bash
# From repo root
bun tools/check-env.ts
```

This script checks that all required variables are set and prints their values (masked).

---

## Troubleshooting

See `workflows/troubleshooting.md` for common setup issues.
