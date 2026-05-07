import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "proj_wwlclvzimthdptrduwlg",
  runtime: "node",
  logLevel: "log",
  maxDuration: 300,
  dirs: ["./src/tasks"],
});
