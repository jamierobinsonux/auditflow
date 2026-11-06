import { createServerMockClient } from "@/lib/mockdb/server-transport";

// Prototype: there are no row-level rules, so the admin client is the same
// in-memory client as everything else.
export const supabaseAdmin = createServerMockClient();
