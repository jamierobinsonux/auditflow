import { createMockClient, type Transport } from "./client";
import { handleAuth } from "./auth";
import { execute } from "./execute";
import { deleteFile, saveFile } from "./store";

/** Runs straight against the in-memory store. Used by server code and API routes. */
export const serverTransport: Transport = {
  async query(descriptor) {
    return execute(descriptor);
  },

  async auth(method, args) {
    return handleAuth(method, args);
  },

  async upload(bucket, path, file) {
    try {
      const data =
        file instanceof Uint8Array ? file : new Uint8Array(await (file as Blob).arrayBuffer());

      saveFile(bucket, path, data);
      return { data: { path }, error: null };
    } catch (error: any) {
      return { data: null, error: { message: error?.message || "Upload failed." } };
    }
  },

  async remove(bucket, paths) {
    for (const path of paths) deleteFile(bucket, path);
    return { data: [], error: null };
  },

  origin() {
    return (
      process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${process.env.PORT || 3000}`
    ).replace(/\/$/, "");
  },
};

export function createServerMockClient() {
  return createMockClient(serverTransport);
}
