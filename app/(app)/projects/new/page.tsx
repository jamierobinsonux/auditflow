import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  canCreateProject,
  getUsage,
  getUserSubscription,
} from "@/lib/subscription";
import { NewProjectForm } from "@/components/new-project-form";

export default async function NewProjectPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [subscription, usage] = await Promise.all([
    getUserSubscription(user.id),
    getUsage(user.id),
  ]);

  if (
    !canCreateProject({
      planId: subscription.planId,
      projectsUsed: usage.projectsUsed,
    })
  ) {
    redirect("/settings/billing?limit=projects");
  }

  return <NewProjectForm />;
}
