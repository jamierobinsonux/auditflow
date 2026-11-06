/**
 * Prototype storage: one database for the whole server process, saved to disk.
 *
 * - Data lives in memory while the server runs and is written to `.data/` in
 *   the project folder after every change, then loaded again on startup.
 * - Uploaded images are plain files in `.data/files/`.
 * - Delete the `.data` folder (or run `npm run reset-data`) to start fresh.
 * - There is one built-in local user and no sign-in.
 * - Set AUDITFLOW_DATA_DIR to keep the data somewhere else.
 */
import fs from "node:fs";
import path from "node:path";

export type Row = Record<string, any>;

type Store = {
  tables: Map<string, Row[]>;
  userMetadata: Record<string, any>;
};

const DEFAULT_METADATA = { full_name: "Local User", workspace_name: "AuditFlow Workspace" };

export function dataDir() {
  return path.resolve(process.env.AUDITFLOW_DATA_DIR || path.join(process.cwd(), ".data"));
}

function databaseFile() {
  return path.join(dataDir(), "database.json");
}

function loadFromDisk(): Store {
  const empty: Store = { tables: new Map(), userMetadata: { ...DEFAULT_METADATA } };
  const file = databaseFile();

  if (!fs.existsSync(file)) return empty;

  try {
    const saved = JSON.parse(fs.readFileSync(file, "utf8"));

    return {
      tables: new Map(Object.entries(saved.tables ?? {}) as [string, Row[]][]),
      userMetadata: { ...DEFAULT_METADATA, ...(saved.userMetadata ?? {}) },
    };
  } catch (error) {
    // Don't crash, and don't overwrite what might be recoverable.
    const backup = `${file}.corrupt-${Date.now()}`;
    try {
      fs.renameSync(file, backup);
      console.warn(`[mockdb] Could not read ${file}. Moved it to ${backup} and started empty.`);
    } catch {
      console.warn("[mockdb] Could not read the saved database and could not back it up.", error);
    }
    return empty;
  }
}

type Globals = {
  __auditflowStore?: Store;
  __auditflowSaveTimer?: ReturnType<typeof setTimeout> | null;
  __auditflowExitHook?: boolean;
};

const g = globalThis as unknown as Globals;

// Lives on globalThis so hot reloads in `next dev` don't reload from disk.
export const store: Store = (g.__auditflowStore ??= loadFromDisk());

export function saveNow() {
  if (g.__auditflowSaveTimer) {
    clearTimeout(g.__auditflowSaveTimer);
    g.__auditflowSaveTimer = null;
  }

  try {
    fs.mkdirSync(dataDir(), { recursive: true });

    const body = JSON.stringify(
      { tables: Object.fromEntries(store.tables), userMetadata: store.userMetadata },
      null,
      2
    );

    // Write to a temp file first so a crash can't leave a half-written database.
    const temp = `${databaseFile()}.tmp`;
    fs.writeFileSync(temp, body);
    fs.renameSync(temp, databaseFile());
  } catch (error) {
    console.warn("[mockdb] Could not save data to disk. Changes are kept in memory only.", error);
  }
}

/** Call after any change. Saves shortly after, batching bursts of writes. */
export function scheduleSave() {
  if (!g.__auditflowExitHook) {
    g.__auditflowExitHook = true;
    process.on("exit", () => {
      if (g.__auditflowSaveTimer) saveNow();
    });
  }

  if (g.__auditflowSaveTimer) return;
  g.__auditflowSaveTimer = setTimeout(saveNow, 150);
}

export const LOCAL_USER_ID = "00000000-0000-4000-8000-000000000001";
export const LOCAL_USER_EMAIL = "you@auditflow.local";

export function getLocalUser() {
  return {
    id: LOCAL_USER_ID,
    email: LOCAL_USER_EMAIL,
    aud: "authenticated",
    role: "authenticated",
    app_metadata: {},
    user_metadata: { ...store.userMetadata },
    identities: [{ id: LOCAL_USER_ID }],
    created_at: "2026-01-01T00:00:00.000Z",
  };
}

export function getTable(name: string): Row[] {
  let rows = store.tables.get(name);

  if (!rows) {
    rows = [];
    store.tables.set(name, rows);
  }

  return rows;
}

// ---- uploaded files -------------------------------------------------------

const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
  avif: "image/avif",
  pdf: "application/pdf",
};

export function contentTypeFor(filePath: string) {
  const extension = filePath.split(".").pop()?.toLowerCase() ?? "";
  return CONTENT_TYPES[extension] ?? "application/octet-stream";
}

/** Disk location for a stored file, or null if the path tries to escape the folder. */
function filePathOnDisk(bucket: string, filePath: string) {
  const root = path.join(dataDir(), "files");
  const resolved = path.resolve(root, bucket, filePath);

  return resolved.startsWith(root + path.sep) ? resolved : null;
}

export function saveFile(bucket: string, filePath: string, data: Uint8Array) {
  const target = filePathOnDisk(bucket, filePath);
  if (!target) throw new Error("Invalid file path.");

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, data);
}

export function readFile(bucket: string, filePath: string): Uint8Array | null {
  const target = filePathOnDisk(bucket, filePath);

  try {
    return target ? new Uint8Array(fs.readFileSync(target)) : null;
  } catch {
    return null;
  }
}

export function deleteFile(bucket: string, filePath: string) {
  const target = filePathOnDisk(bucket, filePath);
  if (!target) return;

  try {
    fs.rmSync(target, { force: true });
  } catch {
    // Already gone.
  }
}
