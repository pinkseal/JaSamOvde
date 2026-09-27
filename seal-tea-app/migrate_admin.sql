-- МИГРАЦИЯ: выполните эти команды в Neon (Query), КАЖДУЮ ОТДЕЛЬНО, как и раньше со schema.sql.
-- Нужна один раз для базы, которая уже была создана до появления админ-панели.
-- Если вы создаёте базу с нуля — просто используйте обновлённый schema.sql, эта миграция не нужна.

ALTER TABLE accounts ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS activity (
  id          text PRIMARY KEY,
  account_id  text NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  kind        text NOT NULL,             -- 'checkin' | 'leave' | 'invite' | 'comment' | 'loyalty'
  detail      text,
  at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_at_idx ON activity (at);

-- Сделайте свой аккаунт администратором (замените sanya_test на свой логин
-- в нижнем регистре — именно тот id, под которым вы регистрировались):
UPDATE accounts SET is_admin = true WHERE id = 'sanya_test';
