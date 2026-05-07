# Tools

CLI scripts for local development and testing.

Run from the repo root with:
```bash
bun tools/<script>.ts
# or
npx ts-node tools/<script>.ts
```

| Script | Purpose |
|---|---|
| `test-lead.ts` | Fire a single sample lead through the qualification task and print the result |
| `seed-test-leads.ts` | Run a batch of diverse sample leads; useful for prompt tuning |
| `check-env.ts` | Verify all required environment variables are set |
