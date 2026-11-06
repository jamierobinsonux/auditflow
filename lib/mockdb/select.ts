import { getTable, type Row } from "./store";

export type EmbedSpec = {
  alias: string;
  table: string;
  inner: boolean;
  columns: ParsedSelect;
};

export type ParsedSelect = {
  all: boolean;
  columns: string[];
  embeds: EmbedSpec[];
};

/** Split "a, b, c:t(x, y)" on top-level commas only. */
function splitTopLevel(input: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";

  for (const char of input) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;

    if (char === "," && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  if (current.trim()) parts.push(current);
  return parts.map((part) => part.trim()).filter(Boolean);
}

const EMBED_PATTERN = /^(?:(\w+):)?(\w+)(!inner)?\(([\s\S]*)\)$/;

export function parseSelect(input?: string | null): ParsedSelect {
  const parsed: ParsedSelect = { all: false, columns: [], embeds: [] };
  const source = (input ?? "*").trim() || "*";

  for (const part of splitTopLevel(source)) {
    if (part === "*") {
      parsed.all = true;
      continue;
    }

    const embed = part.match(EMBED_PATTERN);

    if (embed) {
      parsed.embeds.push({
        alias: embed[1] || embed[2],
        table: embed[2],
        inner: Boolean(embed[3]),
        columns: parseSelect(embed[4]),
      });
      continue;
    }

    parsed.columns.push(part);
  }

  return parsed;
}

/**
 * How a table points at another one. Only the joins the app actually uses are
 * listed. "one" = this row holds a foreign key, "many" = the other table does.
 */
const RELATIONS: Record<string, { kind: "one" | "many"; fk: string }> = {
  "findings>projects": { kind: "one", fk: "project_id" },
  "report_exports>projects": { kind: "one", fk: "project_id" },
  "projects>clients": { kind: "one", fk: "client_id" },
  "studio_frameworks>studio_framework_categories": { kind: "many", fk: "framework_id" },
  "studio_frameworks>studio_framework_journey_stages": { kind: "many", fk: "framework_id" },
  "studio_frameworks>studio_framework_recommendations": { kind: "many", fk: "framework_id" },
  "studio_frameworks>studio_framework_report_defaults": { kind: "many", fk: "framework_id" },
};

function singular(name: string) {
  return name.endsWith("ies")
    ? `${name.slice(0, -3)}y`
    : name.endsWith("s")
      ? name.slice(0, -1)
      : name;
}

/** Raw related row(s) for one embed, before the embed's own column selection. */
export function relatedRows(parentTable: string, row: Row, childTable: string): Row | Row[] | null {
  const relation =
    RELATIONS[`${parentTable}>${childTable}`] ??
    ({ kind: "one", fk: `${singular(childTable)}_id` } as const);

  const children = getTable(childTable);

  if (relation.kind === "one") {
    const key = row[relation.fk];
    if (key === null || key === undefined) return null;
    return children.find((child) => child.id === key) ?? null;
  }

  return children.filter((child) => child[relation.fk] === row.id);
}

/** Pick columns (and resolve embedded tables) for one row. */
export function projectRow(table: string, row: Row, spec: ParsedSelect): Row {
  const output: Row = spec.all ? { ...row } : {};

  for (const column of spec.columns) {
    output[column] = row[column];
  }

  for (const embed of spec.embeds) {
    const related = relatedRows(table, row, embed.table);

    if (Array.isArray(related)) {
      output[embed.alias] = related.map((child) =>
        projectRow(embed.table, child, embed.columns)
      );
    } else {
      output[embed.alias] = related
        ? projectRow(embed.table, related, embed.columns)
        : null;
    }
  }

  return output;
}
