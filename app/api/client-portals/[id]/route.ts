import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const subscription = await getUserSubscription(user.id);
  if (!subscription.isStudio) {
    return Response.json({ error: "Studio subscription required." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};

  if (typeof body.portal_enabled === "boolean") {
    updates.portal_enabled = body.portal_enabled;
  }

  if (body.action === "regenerate") {
    updates.portal_token = randomUUID();
    updates.portal_last_regenerated = new Date().toISOString();
    updates.portal_enabled = true;
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "No portal changes provided." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("clients")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, portal_enabled, portal_token, portal_last_regenerated")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ client: data });
}
