import type { DbResult, Descriptor } from "./execute";

export type RunQuery = (descriptor: Descriptor) => Promise<DbResult>;

type CountOption = { count?: "exact" | "planned" | "estimated"; head?: boolean };

/**
 * Chainable query builder with the same shape as supabase-js, e.g.
 *   client.from("projects").select("*").eq("id", id).maybeSingle()
 * Awaiting it runs the query.
 */
export class QueryBuilder<T = any[]> implements PromiseLike<DbResult<T>> {
  private descriptor: Descriptor;

  constructor(
    table: string,
    private runQuery: RunQuery
  ) {
    this.descriptor = { table, op: "select", filters: [], orders: [] };
  }

  select(columns = "*", options?: CountOption): QueryBuilder<any[]> {
    if (this.descriptor.op === "select") {
      this.descriptor.columns = columns;
      if (options?.count) this.descriptor.count = true;
      if (options?.head) this.descriptor.head = true;
    } else {
      this.descriptor.returning = true;
      this.descriptor.columns = columns;
    }
    return this as unknown as QueryBuilder<any[]>;
  }

  insert(values: any): QueryBuilder<any[]> {
    this.descriptor.op = "insert";
    this.descriptor.payload = values;
    return this as unknown as QueryBuilder<any[]>;
  }

  upsert(values: any, options?: { onConflict?: string }): QueryBuilder<any[]> {
    this.descriptor.op = "upsert";
    this.descriptor.payload = values;
    this.descriptor.onConflict = options?.onConflict;
    return this as unknown as QueryBuilder<any[]>;
  }

  update(values: any, options?: CountOption): QueryBuilder<any[]> {
    this.descriptor.op = "update";
    this.descriptor.payload = values;
    if (options?.count) this.descriptor.count = true;
    return this as unknown as QueryBuilder<any[]>;
  }

  delete(options?: CountOption): QueryBuilder<any[]> {
    this.descriptor.op = "delete";
    if (options?.count) this.descriptor.count = true;
    return this as unknown as QueryBuilder<any[]>;
  }

  eq(column: string, value: any) {
    this.descriptor.filters.push({ op: "eq", column, value });
    return this;
  }

  neq(column: string, value: any) {
    this.descriptor.filters.push({ op: "neq", column, value });
    return this;
  }

  is(column: string, value: any) {
    this.descriptor.filters.push({ op: "is", column, value });
    return this;
  }

  in(column: string, value: any[]) {
    this.descriptor.filters.push({ op: "in", column, value });
    return this;
  }

  like(column: string, value: string) {
    this.descriptor.filters.push({ op: "like", column, value });
    return this;
  }

  ilike(column: string, value: string) {
    this.descriptor.filters.push({ op: "ilike", column, value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }) {
    this.descriptor.orders.push({
      column,
      ascending: options?.ascending ?? true,
      nullsFirst: options?.nullsFirst,
    });
    return this;
  }

  limit(count: number) {
    this.descriptor.limit = count;
    return this;
  }

  single(): QueryBuilder<any> {
    this.descriptor.single = "single";
    return this as unknown as QueryBuilder<any>;
  }

  maybeSingle(): QueryBuilder<any> {
    this.descriptor.single = "maybeSingle";
    return this as unknown as QueryBuilder<any>;
  }

  then<TResult1 = DbResult<T>, TResult2 = never>(
    onfulfilled?: ((value: DbResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.runQuery(this.descriptor).then(onfulfilled as any, onrejected as any);
  }
}
