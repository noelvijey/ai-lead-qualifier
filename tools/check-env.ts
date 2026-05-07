import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

const BACKEND_ENV = path.resolve(__dirname, "../backend/.env");
const FRONTEND_ENV = path.resolve(__dirname, "../frontend/.env.local");

const BACKEND_REQUIRED = ["TRIGGER_SECRET_KEY", "ANTHROPIC_API_KEY"];
const FRONTEND_REQUIRED = ["TRIGGER_SECRET_KEY", "NEXT_PUBLIC_TRIGGER_PROJECT_REF"];

function mask(value: string): string {
  if (value.length <= 8) return "****";
  return value.slice(0, 4) + "****" + value.slice(-4);
}

function checkEnvFile(filePath: string, required: string[], label: string) {
  console.log(`\n=== ${label} (${filePath}) ===`);

  if (!fs.existsSync(filePath)) {
    console.error(`  ERROR: File not found. Run: cp ${filePath.replace(".env", ".env.example").replace(".local", ".local.example")} ${filePath}`);
    return false;
  }

  const parsed = dotenv.parse(fs.readFileSync(filePath));
  let allOk = true;

  for (const key of required) {
    const value = parsed[key];
    if (!value) {
      console.error(`  MISSING: ${key}`);
      allOk = false;
    } else {
      console.log(`  OK: ${key} = ${mask(value)}`);
    }
  }

  return allOk;
}

const backendOk = checkEnvFile(BACKEND_ENV, BACKEND_REQUIRED, "Backend");
const frontendOk = checkEnvFile(FRONTEND_ENV, FRONTEND_REQUIRED, "Frontend");

console.log();
if (backendOk && frontendOk) {
  console.log("All environment variables are set.");
} else {
  console.error("Some variables are missing. Fix them before running the app.");
  process.exit(1);
}
