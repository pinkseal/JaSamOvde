import { sql } from '../../../lib/db';
import { getSession } from '../../../lib/session';
import { requireAdmin, logActivity } from '../../../lib/activity';
import { cleanId } from '../../../lib/ids';

var LOYALTY_GOAL = 8;

export default async function handler(req, res) {
  try {
    var session = await getSession(req, res);
    if (!session.uid) return res.status(401).json({ error: 'Не авторизован' });
    if (!(await requireAdmin(session.uid))) return res.status(403).json({ error: 'Доступно только администратору' });

    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    var body = req.body || {};
    var targetId = cleanId(body.id || body.username || '');
    if (!targetId) return res.status(400).json({ error: 'Не указан посетитель' });

    var rows = await sql`SELECT id, loyalty FROM accounts WHERE id = ${targetId}`;
    if (!rows[0]) return res.status(404).json({ error: 'Такой кабинет не найден' });

    var next = rows[0].loyalty >= LOYALTY_GOAL ? 0 : rows[0].loyalty + 1;
    await sql`UPDATE accounts SET loyalty = ${next} WHERE id = ${targetId}`;

    var adminRow = await sql`SELECT username FROM accounts WHERE id = ${session.uid}`;
    var adminName = (adminRow[0] && adminRow[0].username) || session.uid;
    await logActivity(targetId, 'loyalty', 'admin:' + adminName + ' +1');

    return res.status(200).json({ id: targetId, loyalty: next });
  } catch (e) {
    console.error('admin/loyalty error', e);
    return res.status(500).json({ error: e.isSessionError ? e.message : 'Что-то пошло не так' });
  }
}
