import { getTable, scheduleSave, type Row } from "./store";
import { parseSelect, projectRow, relatedRows, type ParsedSelect } from "./select";

export type Filter = {
  op: "eq" | "neq" | "is" | "in" | "like" | "ilike";
  column: string;
  value: any;
};

export type Descriptor = {
  table: string;
  op: "select" | "insert" | "update" | "delete" | "upsert";
  columns?: string;
  payload?: any;
  filters: Filter[];
  orders: { column: string; ascending: boolean; nullsFirst?: boolean }[];
  limit?: number;
  single?: "single" | "maybeSingle";
  count?: boolean;
  head?: boolean;
  /** For insert/update/upsert/delete: `.select()` was chained, so return rows. */
  returning?: boolean;
  onConflict?: string;
};

export type DbError = { message: string; code?: string };
export type DbResult<T = any> = { data: T | null; error: DbError | null; count: number | null };

/** Columns the real database fills in when the app doesn't send them. */
const DEFAULTS: Record<string, () => Row> = {
  projects: () => ({ archived: false, status: "In Progress" }),
  clients: () => ({ status: "Active", archived: false, portal_enabled: false }),
  studio_frameworks: () => ({ status: "Active" }),
  studio_recommendations: () => ({ status: "Active" }),
};

function newId() {
  return globalThis.crypto.randomUUID();
}

function normalize(value: any) {
  return value === undefined ? null : value;
}

function likeToRegExp(pattern: string, caseInsensitive: boolean) {
  const source = pattern
    .split("")
    .map((char) => {
      if (char === "%") return ".*";
      if (char === "_") return ".";
      return char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("");

  return new RegExp(`^${source}$`, caseInsensitive ? "is" : "s");
}

function matches(filter: Filter, current: any) {
  const value = normalize(current);

  switch (filter.op) {
    case "eq":
      // A missing boolean behaves like false, as a NOT NULL DEFAULT false column would.
      if (filter.value === false) return value === false || value === null;
      return value === normalize(filter.value);
    case "neq":
      return value !== normalize(filter.value);
    case "is":
      return value === normalize(filter.value);
    case "in":
      return Array.isArray(filter.value) && filter.value.includes(value);
    case "like":
    case "ilike":
      return (
        typeof value === "string" &&
        likeToRegExp(String(filter.value), filter.op === "ilike").test(value)
      );
  }
}

/** Read a column, following "embeddedTable.column" into joined rows. */
function readColumn(table: string, row: Row, column: string) {
  if (!column.includes(".")) return row[column];

  const [embedName, ...rest] = column.split(".");
  const related = relatedRows(table, row, embedName);
  const target = Array.isArray(related) ? related[0] : related;

  return target ? target[rest.join(".")] : null;
}

function compare(a: any, b: any) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function sortRows(rows: Row[], orders: Descriptor["orders"]) {
  if (orders.length === 0) return rows;

  return [...rows].sort((left, right) => {
    for (const order of orders) {
      const a = normalize(left[order.column]);
      const b = normalize(right[order.column]);

      if (a === b) continue;

      // Postgres treats NULL as larger than everything unless told otherwise.
      const nullsFirst = order.nullsFirst ?? !order.ascending;
      if (a === null) return nullsFirst ? -1 : 1;
      if (b === null) return nullsFirst ? 1 : -1;

      const result = compare(a, b);
      if (result !== 0) return order.ascending ? result : -result;
    }

    return 0;
  });
}

function clone<T>(value: T): T {
  return value === undefined ? value : structuredClone(value);
}

function finish(
  descriptor: Descriptor,
  rows: Row[],
  count: number | null
): DbResult {
  if (descriptor.single) {
    if (rows.length === 1) return { data: clone(rows[0]), error: null, count };

    if (rows.length === 0 && descriptor.single === "maybeSingle") {
      return { data: null, error: null, count };
    }

    return {
      data: null,
      error: {
        code: "PGRST116",
        message:
          rows.length === 0
            ? "JSON object requested, multiple (or no) rows returned"
            : "JSON object requested, multiple (or no) rows returned",
      },
      count,
    };
  }

  return { data: clone(rows), error: null, count };
}

export function execute(descriptor: Descriptor): DbResult {
  try {
    const result = run(descriptor);
    if (descriptor.op !== "select" && !result.error) scheduleSave();
    return result;
  } catch (error: any) {
    return { data: null, error: { message: error?.message || "Database error" }, count: null };
  }
}

function run(descriptor: Descriptor): DbResult {
  const { table, op } = descriptor;
  const rows = getTable(table);
  const spec: ParsedSelect = parseSelect(descriptor.columns);
  const now = new Date().toISOString();

  const matching = (candidates: Row[]) =>
    candidates.filter((row) =>
      descriptor.filters.every((filter) =>
        matches(filter, readColumn(table, row, filter.column))
      )
    );

  // ---- select -----------------------------------------------------------
  if (op === "select") {
    let found = matching(rows);

    // `table!inner(...)` drops rows that have no matching joined row.
    for (const embed of spec.embeds.filter((item) => item.inner)) {
      found = found.filter((row) => {
        const related = relatedRows(table, row, embed.table);
        return Array.isArray(related) ? related.length > 0 : Boolean(related);
      });
    }

    found = sortRows(found, descriptor.orders);
    const total = found.length;

    if (descriptor.limit !== undefined) found = found.slice(0, descriptor.limit);

    if (descriptor.head) {
      return { data: null, error: null, count: descriptor.count ? total : null };
    }

    return finish(
      descriptor,
      found.map((row) => projectRow(table, row, spec)),
      descriptor.count ? total : null
    );
  }

  // ---- insert / upsert --------------------------------------------------
  if (op === "insert" || op === "upsert") {
    const inputs: Row[] = Array.isArray(descriptor.payload)
      ? descriptor.payload
      : [descriptor.payload];
    const conflictColumns = (descriptor.onConflict || "id")
      .split(",")
      .map((column) => column.trim());
    const written: Row[] = [];

    for (const input of inputs) {
      if (op === "upsert") {
        const existing = rows.find((row) =>
          conflictColumns.every(
            (column) => input[column] !== undefined && row[column] === input[column]
          )
        );

        if (existing) {
          Object.assign(existing, input, { updated_at: now });
          written.push(existing);
          continue;
        }
      }

      const row: Row = {
        id: newId(),
        created_at: now,
        updated_at: now,
        ...(DEFAULTS[table]?.() ?? {}),
        ...input,
      };

      rows.push(row);
      written.push(row);
    }

    return descriptor.returning
      ? finish(descriptor, written.map((row) => projectRow(table, row, spec)), null)
      : { data: null, error: null, count: null };
  }

  // ---- update -----------------------------------------------------------
  if (op === "update") {
    const targets = matching(rows);

    for (const row of targets) {
      Object.assign(row, descriptor.payload);
      if (!("updated_at" in (descriptor.payload ?? {}))) row.updated_at = now;
    }

    return descriptor.returning
      ? finish(descriptor, targets.map((row) => projectRow(table, row, spec)), null)
      : { data: null, error: null, count: descriptor.count ? targets.length : null };
  }

  // ---- delete -----------------------------------------------------------
  const doomed = new Set(matching(rows));
  const remaining = rows.filter((row) => !doomed.has(row));
  rows.splice(0, rows.length, ...remaining);

  return descriptor.returning
    ? finish(descriptor, [...doomed].map((row) => projectRow(table, row, spec)), null)
    : { data: null, error: null, count: descriptor.count ? doomed.size : null };
}
