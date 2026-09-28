import bcrypt from 'bcryptjs';
import { sql } from '../../../lib/db';
import { getSession } from '../../../lib/session';
import { requireAdmin } from '../../../lib/activity';
import { cleanId } from '../../../lib/ids';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    var session = await getSession(req, res);
    if (!session.uid) return res.status(401).json({ error: 'Не авторизован' });
    if (!(await requireAdmin(session.uid))) return res.status(403).json({ error: 'Доступно только администратору' });

    var body = req.body || {};
    var targetId = cleanId(body.id || '');
    var password = String(body.password || '');
    if (!targetId) return res.status(400).json({ error: 'Не указан посетитель' });
    if (password.length < 4) return res.status(400).json({ error: 'Пароль — минимум 4 символа' });

    var acc = await sql`SELECT id FROM accounts WHERE id = ${targetId}`;
    if (!acc[0]) return res.status(404).json({ error: 'Такой кабинет не найден' });

    var hash = await bcrypt.hash(password, 10);
    await sql`UPDATE accounts SET pass_hash = ${hash} WHERE id = ${targetId}`;
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('admin/set-password error', e);
    return res.status(500).json({ error: e.isSessionError ? e.message : 'Что-то пошло не так' });
  }
}
