import { getLocalUser, scheduleSave, store } from "./store";

/** Stand-in for supabase.auth: there is one local user and nothing to sign in to. */
export function handleAuth(method: string, args: any[]): any {
  const user = getLocalUser();

  switch (method) {
    case "getUser":
    case "admin.getUserById":
      return { data: { user }, error: null };

    case "getSession":
      return { data: { session: { user } }, error: null };

    case "updateUser": {
      const data = args[0]?.data;
      if (data && typeof data === "object") {
        for (const [key, value] of Object.entries(data)) {
          if (value === null || value === undefined) delete store.userMetadata[key];
          else store.userMetadata[key] = value;
        }
      }
      scheduleSave();
      return { data: { user: getLocalUser() }, error: null };
    }

    case "admin.listUsers":
      return { data: { users: [user] }, error: null };

    case "signInWithPassword":
    case "signUp":
    case "exchangeCodeForSession":
      return { data: { user, session: { user } }, error: null };

    default:
      // signOut, signInWithOAuth, resetPasswordForEmail, admin.deleteUser, ...
      return { data: {}, error: null };
  }
}
