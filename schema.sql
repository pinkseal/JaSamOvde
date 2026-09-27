-- Запустите этот файл один раз в Query-вкладке вашей базы данных
-- (Vercel → Storage → ваша база, или сразу в Neon → Query), КАЖДУЮ команду отдельно —
-- некоторые SQL-консоли (в т.ч. Neon) не разрешают выполнять несколько команд за раз.

CREATE TABLE IF NOT EXISTS accounts (
  id          text PRIMARY KEY,          -- нормализованный логин (латиница/цифры/._-)
  username    text NOT NULL,             -- логин как ввёл пользователь
  pass_hash   text NOT NULL,             -- bcrypt-хеш пароля
  nick        text NOT NULL,             -- анонимный ник, который видят другие
  emoji       text NOT NULL,             -- аватар-эмодзи
  loyalty     integer NOT NULL DEFAULT 0,
  is_admin    boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS presence (
  id    text PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  zone  text NOT NULL,                   -- 'top' | 'middle' | 'basement'
  mood  text NOT NULL,                   -- 'open' | 'games' | 'company' | 'quiet'
  at    timestamptz NOT NULL             -- когда отметились (не обновляется при смене этажа)
);

CREATE TABLE IF NOT EXISTS invites (
  id          text PRIMARY KEY,
  uid         text NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  text        text NOT NULL,
  date        text NOT NULL,             -- 'YYYY-MM-DD'
  time        text NOT NULL,             -- 'HH:MM'
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comments (
  id          text PRIMARY KEY,
  invite_id   text NOT NULL REFERENCES invites(id) ON DELETE CASCADE,
  uid         text NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  text        text NOT NULL,
  at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS comments_invite_idx ON comments (invite_id);

CREATE TABLE IF NOT EXISTS activity (
  id          text PRIMARY KEY,
  account_id  text NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  kind        text NOT NULL,             -- 'checkin' | 'leave' | 'invite' | 'comment' | 'loyalty'
  detail      text,
  at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_at_idx ON activity (at);
