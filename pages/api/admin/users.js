import { sql } from '../../../lib/db';
import { getSession } from '../../../lib/session';
import { requireAdmin } from '../../../lib/activity';

export default async function handler(req, res) {
  try {
    var session = await getSession(req, res);
    if (!session.uid) return res.status(401).json({ error: 'Не авторизован' });
    if (!(await requireAdmin(session.uid))) return res.status(403).json({ error: 'Доступно только администратору' });

    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    var rows = await sql`
      SELECT id, username, nick, emoji, loyalty, is_admin, created_at
      FROM accounts
      ORDER BY created_at DESC
    `;
    return res.status(200).json(rows);
  } catch (e) {
    console.error('admin/users error', e);
    return res.status(500).json({ error: e.isSessionError ? e.message : 'Что-то пошло не так' });
  }
}
