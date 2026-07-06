import { Sidebar } from "@/components/sidebar";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscription } from "@/lib/subscription";
import { NotificationBell } from "@/components/notification-bell";

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

      <main className="min-h-screen lg:ml-72">
        <div className="sticky top-0 z-40 flex h-16 items-center justify-end border-b border-slate-200 bg-[#F1F5F9]/90 px-4 pl-16 backdrop-blur sm:px-6 lg:pl-6">
          <NotificationBell />
        </div>
        {children}
      </main>
    </div>
  );
}