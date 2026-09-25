import bcrypt from 'bcryptjs';
import { sql } from '../../lib/db';
import { getSession } from '../../lib/session';
import { cleanId } from '../../lib/ids';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  var body = req.body || {};
  var id = cleanId(body.username || '');
  var password = String(body.password || '');

  if (!id || !password) return res.status(400).json({ error: 'Введите логин и пароль' });

  try {
    var rows = await sql`SELECT * FROM accounts WHERE id = ${id}`;
    var acc = rows[0];
    // Одинаковое сообщение для "нет такого логина" и "неверный пароль",
    // чтобы не подсказывать, какие логины уже заняты.
    if (!acc) return res.status(401).json({ error: 'Неверный логин или пароль' });

    var ok = await bcrypt.compare(password, acc.pass_hash);
    if (!ok) return res.status(401).json({ error: 'Неверный логин или пароль' });

    var session = await getSession(req, res);
    session.uid = id;
    await session.save();

    return res.status(200).json({
      id: id,
      username: acc.username,
      nick: acc.nick,
      emoji: acc.emoji,
      loyalty: acc.loyalty,
    });
  } catch (e) {
    console.error('login error', e);
    return res.status(500).json({ error: 'Не получилось войти. Попробуйте ещё раз.' });
  }
}
