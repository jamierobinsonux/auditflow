export function formatDisplayName(name: string | null | undefined) {
  if (!name) return "There";

  return name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}