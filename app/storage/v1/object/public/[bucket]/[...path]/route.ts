import { contentTypeFor, readFile } from "@/lib/mockdb/store";

export const dynamic = "force-dynamic";

// Serves uploaded files from the prototype's data folder, using the same URL
// shape as Supabase public storage.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bucket: string; path: string[] }> }
) {
  const { bucket, path } = await params;
  const filePath = path.join("/");
  const data = readFile(bucket, filePath);

  if (!data) return new Response("Not found", { status: 404 });

  return new Response(data as unknown as BodyInit, {
    headers: {
      "Content-Type": contentTypeFor(filePath),
      "Cache-Control": "no-store",
    },
  });
}
