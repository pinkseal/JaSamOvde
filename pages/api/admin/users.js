import { sql } from '../../../lib/db';
import { getSession } from '../../../lib/session';
import { requireAdmin } from '../../../lib/activity';
import { cleanId } from '../../../lib/ids';

export default async function handler(req, res) {
  try {
    var session = await getSession(req, res);
    if (!session.uid) return res.status(401).json({ error: 'Не авторизован' });
    if (!(await requireAdmin(session.uid))) return res.status(403).json({ error: 'Доступно только администратору' });

    if (req.method === 'GET') {
      var rows = await sql`
        SELECT id, username, nick, emoji, loyalty, teapots, is_admin, created_at
        FROM accounts
        ORDER BY created_at DESC
      `;
      return res.status(200).json(rows);
    }

    if (req.method === 'DELETE') {
      var delId = cleanId(req.query.id || '');
      if (!delId) return res.status(400).json({ error: 'Не хватает id' });
      if (delId === session.uid) return res.status(400).json({ error: 'Нельзя удалить свой собственный аккаунт из панели' });
      await sql`DELETE FROM accounts WHERE id = ${delId}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('admin/users error', e);
    return res.status(500).json({ error: e.isSessionError ? e.message : 'Что-то пошло не так' });
  }
}
