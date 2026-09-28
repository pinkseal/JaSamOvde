import { neon } from '@neondatabase/serverless';

// POSTGRES_URL (or DATABASE_URL) is injected automatically once you attach
// a Postgres/Neon database to your Vercel project under Storage.
const connectionString =
  process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  // We don't throw at import time (that would break local `next build`
  // without a database configured yet) — only when a query actually runs.
  console.warn(
    '[db] POSTGRES_URL / DATABASE_URL is not set. Add a Postgres database to this project in Vercel → Storage.'
  );
}

export const sql = neon(connectionString || 'postgres://placeholder');
