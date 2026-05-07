/**
 * Fires a single sample agency lead through the qualify-lead Trigger.dev task.
 * Requires the backend worker to be running: cd backend && npx trigger dev
 */
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../backend/.env") });

import { configure, tasks, runs } from "@trigger.dev/sdk/v3";

const TRIGGER_SECRET_KEY = process.env.TRIGGER_SECRET_KEY;
if (!TRIGGER_SECRET_KEY) {
  throw new Error("TRIGGER_SECRET_KEY is not set in backend/.env");
}

configure({ secretKey: TRIGGER_SECRET_KEY });

const sampleLead = {
  companyName: "GrowFast Digital",
  contactName: "Sarah Chen",
  contactEmail: "sarah@growfastdigital.com",
  industry: "E-commerce",
  projectType: "Web app build",
  projectDescription:
    "We need a custom order management dashboard integrated with our Shopify store. " +
    "Currently managing everything in spreadsheets — it's a mess. " +
    "Need real-time inventory sync, bulk order processing, and automated reorder alerts.",
  estimatedBudget: "$15,000–$25,000",
  decisionTimeline: "This month",
  projectDurationEstimate: "2–3 months",
  decisionMakerAccess: true,
  stakeholderCount: 2,
  painPoints:
    "Manual spreadsheet order management is causing 3–4 hours of extra work per day. " +
    "We've had two inventory stockouts this quarter because of delayed visibility.",
  currentSolution: "Google Sheets + Shopify admin",
  desiredOutcome:
    "Eliminate manual data entry, reduce stockouts to zero, and give the ops team a single dashboard.",
  previousAgencyExperience: true,
  leadSource: "Referral",
  notes: "Referred by previous client Mark T. High urgency — wants to start ASAP.",
};

async function main() {
  console.log("Triggering qualify-lead task with sample lead...\n");
  console.log("Lead:", JSON.stringify(sampleLead, null, 2));
  console.log("\n---\n");

  const handle = await tasks.trigger("qualify-lead", sampleLead);
  console.log(`Run triggered: ${handle.id}`);
  console.log("Waiting for result (polling every 2s)...\n");

  const result = await runs.poll(handle.id, { pollIntervalMs: 2000 });

  if (result.status === "COMPLETED") {
    console.log("Qualification Result:");
    console.log(JSON.stringify(result.output, null, 2));
  } else {
    console.error("Run did not complete successfully. Status:", result.status);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
