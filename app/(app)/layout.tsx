import { Sidebar } from "@/components/sidebar";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const subscription = user ? await getUserSubscription(user.id) : null;

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <Sidebar user={user} isStudio={Boolean(subscription?.isStudio)} />

      <main className="ml-72 min-h-screen">{children}</main>
    </div>
  );
}