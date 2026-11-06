import { redirect } from "next/navigation";

// Personal mode has no billing. Old links and redirects land on Settings.
export default function BillingPage() {
  redirect("/settings");
}
