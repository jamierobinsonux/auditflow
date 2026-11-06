import { QueryBuilder, type RunQuery } from "./builder";

/** How a client reaches the store: directly (server) or over HTTP (browser). */
export type Transport = {
  query: RunQuery;
  auth(method: string, args: any[]): Promise<any>;
  upload(
    bucket: string,
    path: string,
    file: Blob | Uint8Array,
    options?: { contentType?: string }
  ): Promise<{ data: { path: string } | null; error: { message: string } | null }>;
  remove(
    bucket: string,
    paths: string[]
  ): Promise<{ data: any; error: { message: string } | null }>;
  /** Origin used to build public file URLs, e.g. http://localhost:3000 */
  origin(): string;
};

/** Drop-in for the pieces of supabase-js this app uses. */
export function createMockClient(transport: Transport) {
  const call = (method: string) => (...args: any[]) => transport.auth(method, args);

  return {
    from(table: string) {
      return new QueryBuilder(table, transport.query);
    },

    auth: {
      getUser: call("getUser"),
      getSession: call("getSession"),
      updateUser: call("updateUser"),
      signOut: call("signOut"),
      signInWithPassword: call("signInWithPassword"),
      signInWithOAuth: call("signInWithOAuth"),
      signUp: call("signUp"),
      resetPasswordForEmail: call("resetPasswordForEmail"),
      exchangeCodeForSession: call("exchangeCodeForSession"),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe() {} } },
      }),
      admin: {
        listUsers: call("admin.listUsers"),
        getUserById: call("admin.getUserById"),
        deleteUser: call("admin.deleteUser"),
      },
    },

    storage: {
      from(bucket: string) {
        return {
          upload: (path: string, file: Blob | Uint8Array, options?: { contentType?: string }) =>
            transport.upload(bucket, path, file, options),
          remove: (paths: string[]) => transport.remove(bucket, paths),
          getPublicUrl: (path: string) => ({
            data: {
              publicUrl: `${transport.origin()}/storage/v1/object/public/${bucket}/${path
                .split("/")
                .map(encodeURIComponent)
                .join("/")}`,
            },
          }),
        };
      },
    },
  };
}

export type MockClient = ReturnType<typeof createMockClient>;
