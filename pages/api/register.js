import bcrypt from 'bcryptjs';
import { sql } from '../../lib/db';
import { getSession } from '../../lib/session';
import { cleanId } from '../../lib/ids';
import { genPersona } from '../../lib/persona';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  var body = req.body || {};
  var username = String(body.username || '').trim();
  var password = String(body.password || '');

  if (username.length < 2) return res.status(400).json({ error: 'Логин — минимум 2 символа' });
  if (password.length < 4) return res.status(400).json({ error: 'Пароль — минимум 4 символа' });

  var id = cleanId(username);
  if (!id) return res.status(400).json({ error: 'Используйте буквы, цифры, «_», «-» или «.»' });

  try {
    var existing = await sql`SELECT id FROM accounts WHERE id = ${id}`;
    if (existing.length) {
      return res.status(409).json({ error: 'Такой логин уже занят, выберите другой или войдите' });
    }

    var hash = await bcrypt.hash(password, 10);
    var persona = genPersona();

    await sql`
      INSERT INTO accounts (id, username, pass_hash, nick, emoji, loyalty, created_at)
      VALUES (${id}, ${username}, ${hash}, ${persona.nick}, ${persona.emoji}, 0, now())
    `;

    var session = await getSession(req, res);
    session.uid = id;
    await session.save();

    return res.status(200).json({
      id: id,
      username: username,
      nick: persona.nick,
      emoji: persona.emoji,
      loyalty: 0,
    });
  } catch (e) {
    console.error('register error', e);
    return res.status(500).json({ error: 'Не получилось создать кабинет. Попробуйте ещё раз.' });
  }
}
