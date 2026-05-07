# Deployment Runbook

How to deploy the backend to Trigger.dev and the frontend to Vercel.

---

## Backend: Deploy to Trigger.dev

### One-time setup (already done if project exists in Trigger.dev dashboard)

Nothing to do — the Trigger.dev project is already created. The `trigger.config.ts` file links the local codebase to the existing project.

### Deploy

```bash
cd backend
npx trigger deploy
```

This compiles TypeScript and deploys the task(s) to Trigger.dev cloud.

**Verify**: Open the Trigger.dev dashboard → Tasks. The `qualify-lead` task should appear with a green "Active" status.

### Re-deploy after changes

Any change to `backend/src/` requires a re-deploy:

```bash
cd backend
npx trigger deploy
```

The deploy command is idempotent — safe to run multiple times.

---

## Frontend: Deploy to Vercel via GitHub

### One-time Vercel setup

1. Push the repo to GitHub.
2. Go to vercel.com → New Project → Import Git Repository.
3. Select the repo.
4. Set **Root Directory** to `frontend/` (critical — without this, Vercel builds the repo root and fails).
5. Set **Framework Preset** to `Next.js` (usually auto-detected).
6. Add environment variables:
   - `TRIGGER_SECRET_KEY` = your Trigger.dev secret key
   - `NEXT_PUBLIC_TRIGGER_PROJECT_REF` = your project ref (e.g. `proj_abc123`)
7. Click **Deploy**.

### Subsequent deploys

Just push to `main`. Vercel auto-deploys on every push.

```bash
git add .
git commit -m "your change"
git push origin main
```

Monitor the deploy in the Vercel dashboard. Check **Function Logs** under the deployment for errors in the `/api/qualify` server route.

---

## Environment Variable Checklist

When deploying to production, verify these are set in **both** places:

| Variable | Backend `.env` | Frontend `.env.local` | Vercel Dashboard |
|---|---|---|---|
| `TRIGGER_SECRET_KEY` | ✓ | ✓ | ✓ |
| `ANTHROPIC_API_KEY` | ✓ | — | — |
| `NEXT_PUBLIC_TRIGGER_PROJECT_REF` | — | ✓ | ✓ |

---

## Post-Deployment Verification

1. Open the Vercel deployment URL.
2. Submit a test lead through the form.
3. Verify the result appears on screen.
4. Check the Trigger.dev dashboard to confirm the run completed successfully.
5. Check Vercel function logs for any errors in `/api/qualify`.
