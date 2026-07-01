import type { Client, ClientHealth } from "@/types/client";

type HealthInput = {
  client: Pick<Client, "updated_at" | "created_at" | "status">;
  activeProjects: number;
  openFindings: number;
};

export function getClientInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getClientHealth({
  client,
  activeProjects,
  openFindings,
}: HealthInput): ClientHealth {
  if (client.status === "Inactive") return "Inactive";

  const lastActivity = new Date(client.updated_at || client.created_at).getTime();
  const inactiveForDays = Number.isFinite(lastActivity)
    ? (Date.now() - lastActivity) / (1000 * 60 * 60 * 24)
    : 0;

  if (activeProjects === 0 && openFindings === 0) return "Not Started";
  if (inactiveForDays > 30 && activeProjects > 0) return "Inactive";
  if (openFindings >= 30) return "At Risk";
  if (openFindings >= 12) return "On Track";

  return "Healthy";
}

export function getClientHealthClasses(health: ClientHealth) {
  if (health === "Healthy") return "bg-emerald-100 text-emerald-700";
  if (health === "On Track") return "bg-blue-100 text-blue-700";
  if (health === "At Risk") return "bg-amber-100 text-amber-700";
  if (health === "Not Started") return "bg-slate-100 text-slate-600";
  return "bg-slate-100 text-slate-700";
}

export function formatClientDate(value?: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
