import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";
import { syncAttentionNotifications } from "@/lib/notifications";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await getUserSubscription(user.id);

  await syncAttentionNotifications({
    supabase,
    userId: user.id,
    isStudio: Boolean(subscription.isStudio),
  });

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .is("dismissed_at", null)
    .is("resolved_at", null)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const unreadCount = (notifications ?? []).filter((item) => !item.is_read).length;

  return Response.json({ notifications: notifications ?? [], unreadCount });
}

export async function PATCH() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .is("dismissed_at", null)
    .is("resolved_at", null);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
