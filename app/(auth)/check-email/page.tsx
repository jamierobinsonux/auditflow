import { redirect } from "next/navigation";

// Prototype: there is no sign-in, so this page just goes to the dashboard.
export default function Page() {
  redirect("/dashboard");
}
