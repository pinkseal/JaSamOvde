-- МИГРАЦИЯ №2: выполните эти команды в Neon (Query), КАЖДУЮ ОТДЕЛЬНО.
-- Нужна один раз для базы, где уже выполнены schema.sql и migrate_admin.sql.

ALTER TABLE accounts ADD COLUMN IF NOT EXISTS teapots integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS settings (
  key   text PRIMARY KEY,
  value text
);

CREATE TABLE IF NOT EXISTS announcements (
  id          text PRIMARY KEY,
  title       text NOT NULL,
  body        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);
