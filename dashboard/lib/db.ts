import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type DB = NeonHttpDatabase<typeof schema>;

let _db: DB | null = null;
let _sql: NeonQueryFunction<false, false> | null = null;

function getClient(): { sql: NeonQueryFunction<false, false>; db: DB } {
  if (_db && _sql) return { sql: _sql, db: _db };
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Configure it on Vercel (or in .env.local).",
    );
  }
  _sql = neon(url);
  _db = drizzle(_sql, { schema });
  return { sql: _sql, db: _db };
}

export const db: DB = new Proxy({} as DB, {
  get(_target, prop) {
    const { db } = getClient();
    const value = (db as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? value.bind(db) : value;
  },
});

export { schema };
