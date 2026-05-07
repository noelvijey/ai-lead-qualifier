import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

// Lazy singleton — initialized on first call so the module can load during build-time indexing
export function getAnthropic(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
    _client = new Anthropic({ apiKey });
  }
  return _client;
}
