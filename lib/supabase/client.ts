import { createBrowserMockClient } from "@/lib/mockdb/browser-transport";

// Prototype: same call shape as supabase-js, but backed by the in-memory
// database on the server (see lib/mockdb).
export function createClient() {
  return createBrowserMockClient();
}
