import { createMockClient, type Transport } from "./client";

async function post(body: unknown) {
  const response = await fetch("/api/mockdb", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Prototype database request failed (${response.status}).`);
  }

  return response.json();
}

/** Sends every request to /api/mockdb, which runs it against the server's store. */
export const browserTransport: Transport = {
  query: (descriptor) => post({ kind: "query", descriptor }),

  auth: (method, args) => post({ kind: "auth", method, args }),

  async upload(bucket, path, file, options) {
    const form = new FormData();
    form.append("bucket", bucket);
    form.append("path", path);
    form.append(
      "file",
      file instanceof Blob ? file : new Blob([file as BlobPart], { type: options?.contentType })
    );

    const response = await fetch("/api/mockdb/upload", { method: "POST", body: form });

    if (!response.ok) {
      return { data: null, error: { message: "Upload failed." } };
    }

    return response.json();
  },

  remove: (bucket, paths) => post({ kind: "remove", bucket, paths }),

  origin: () => window.location.origin,
};

// One shared client per page, like supabase-js's browser client. Components
// list the client in useEffect dependencies, so it must stay referentially stable.
let browserClient: ReturnType<typeof createMockClient> | null = null;

export function createBrowserMockClient() {
  browserClient ??= createMockClient(browserTransport);
  return browserClient;
}
