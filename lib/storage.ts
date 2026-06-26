export function createSafeStoragePath(folder: string, file: File): string {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "file";

  const baseName = file.name
    .replace(/\.[^/.]+$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return `${folder}/${Date.now()}-${baseName}.${extension}`;
}