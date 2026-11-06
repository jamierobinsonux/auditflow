import { redirect } from "next/navigation";

// Personal mode: no marketing site. Signed-in users go to the dashboard;
// the middleware sends everyone else to /login.
export default function Home() {
  redirect("/dashboard");
}
