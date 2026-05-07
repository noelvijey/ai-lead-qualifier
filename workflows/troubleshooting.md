# Troubleshooting

Common errors and how to fix them.

---

## Backend

### "Task not found" in Trigger.dev dashboard after deploy

**Cause**: The task is not exported from `backend/src/index.ts`.

**Fix**: Open `backend/src/index.ts` and ensure the task is exported:
```typescript
export { qualifyLead } from "./tasks/qualify-lead";
```
Then re-deploy: `npx trigger deploy`.

---

### `TRIGGER_SECRET_KEY` is not set or invalid

**Symptom**: `Error: Authentication failed` when running `npx trigger dev` or `npx trigger deploy`.

**Fix**: Check `backend/.env`. The key should start with `tr_`. Get it from Trigger.dev dashboard → Project → API Keys → Secret key.

---

### `ANTHROPIC_API_KEY` is not set

**Symptom**: Task fails with `AuthenticationError` in the Trigger.dev run log.

**Fix**: Add `ANTHROPIC_API_KEY` to `backend/.env`. Get it from console.anthropic.com.

---

### Claude returns malformed JSON

**Symptom**: `scorer.ts` throws a parse error; the run fails with "AI qualification failed".

**Cause**: The prompt instructed Claude to return JSON, but it added a preamble like "Here is the JSON:".

**Fix**: Update the prompt in `qualify-lead.ts` to be more explicit: end the system prompt with "Respond ONLY with the JSON object. No preamble, no explanation, no markdown code fences."

---

## Frontend

### CORS error calling Trigger.dev

**Symptom**: Browser console shows `CORS policy` error.

**Cause**: The frontend is calling Trigger.dev directly from browser-side code instead of through the Next.js API route proxy.

**Fix**: All Trigger.dev calls must go through `frontend/src/app/api/qualify/route.ts`. Never import the Trigger.dev server SDK in a client component.

---

### `/api/qualify` returns 500

**Symptom**: Form submits but result never loads; network tab shows 500 on `/api/qualify`.

**Fix**:
1. Check Vercel Function Logs for the error message.
2. Most common cause: `TRIGGER_SECRET_KEY` is not set in Vercel environment variables.
3. Second most common: `NEXT_PUBLIC_TRIGGER_PROJECT_REF` is missing or wrong.

---

### Vercel build fails with "No Next.js project found"

**Cause**: Vercel's **Root Directory** is set to the repo root instead of `frontend/`.

**Fix**: Go to Vercel project → Settings → General → Root Directory → set to `frontend/`.

---

### Result never loads (spinner runs forever)

**Symptom**: Form submits, spinner shows, but result never appears.

**Possible causes**:
1. The Trigger.dev task threw an error — check the run in the Trigger.dev dashboard.
2. The `publicAccessToken` expired before the frontend finished polling — usually means the task took too long (>10 min).
3. WebSocket/SSE connection dropped — refresh and retry.

---

## Local Dev

### `npx trigger dev` can't connect

**Symptom**: `Connection refused` or `Network error` when starting the local worker.

**Fix**: Check your internet connection. The local worker must reach `api.trigger.dev`. It does not work fully offline.

---

### Port 3000 already in use

**Fix**:
```bash
# Find what's using port 3000
lsof -i :3000
# Kill it, or start Next.js on a different port
npm run dev -- -p 3001
```
