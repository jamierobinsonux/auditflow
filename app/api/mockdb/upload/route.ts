import { NextResponse } from "next/server";
import { serverTransport } from "@/lib/mockdb/server-transport";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const bucket = String(form?.get("bucket") || "");
  const path = String(form?.get("path") || "");
  const file = form?.get("file");

  if (!bucket || !path || !(file instanceof Blob)) {
    return NextResponse.json(
      { data: null, error: { message: "Missing file, bucket or path." } },
      { status: 400 }
    );
  }

  return NextResponse.json(await serverTransport.upload(bucket, path, file));
}
