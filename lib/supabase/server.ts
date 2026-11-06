import { createServerMockClient } from "@/lib/mockdb/server-transport";

// Prototype: same call shape as supabase-js, but backed by the in-memory
// database (see lib/mockdb). There is no session or cookie handling.
export async function createClient() {
  return createServerMockClient();
}
