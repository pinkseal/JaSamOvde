import { sql } from '../../../lib/db';
import { getSession } from '../../../lib/session';
import { requireAdmin } from '../../../lib/activity';

export default async function handler(req, res) {
  try {
    var session = await getSession(req, res);
    if (!session.uid) return res.status(401).json({ error: 'Не авторизован' });
    if (!(await requireAdmin(session.uid))) return res.status(403).json({ error: 'Доступно только администратору' });

    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    var date = String(req.query.date || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Некорректная дата' });
    }

    var rows = await sql`
      SELECT act.id, act.kind, act.detail, act.at, a.username, a.nick, a.emoji
      FROM activity act JOIN accounts a ON a.id = act.account_id
      WHERE act.at::date = ${date}::date
      ORDER BY act.at DESC
    `;
    return res.status(200).json(rows);
  } catch (e) {
    console.error('admin/activity error', e);
    return res.status(500).json({ error: e.isSessionError ? e.message : 'Что-то пошло не так' });
  }
}
