import { NextResponse } from "next/server";
import { serverTransport } from "@/lib/mockdb/server-transport";

// Prototype only: lets browser code reach the in-memory database.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  switch (body.kind) {
    case "query":
      return NextResponse.json(await serverTransport.query(body.descriptor));
    case "auth":
      return NextResponse.json(
        await serverTransport.auth(String(body.method), Array.isArray(body.args) ? body.args : [])
      );
    case "remove":
      return NextResponse.json(
        await serverTransport.remove(String(body.bucket), Array.isArray(body.paths) ? body.paths : [])
      );
    default:
      return NextResponse.json({ error: "Unknown request." }, { status: 400 });
  }
}
