import { sql } from '../../../lib/db';
import { getSession } from '../../../lib/session';
import { requireAdmin, logActivity } from '../../../lib/activity';
import { cleanId } from '../../../lib/ids';

var GOALS = { loyalty: 10, teapots: 8 };
var LABELS = { loyalty: 'чашку', teapots: 'чайник' };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    var session = await getSession(req, res);
    if (!session.uid) return res.status(401).json({ error: 'Не авторизован' });
    if (!(await requireAdmin(session.uid))) return res.status(403).json({ error: 'Доступно только администратору' });

    var body = req.body || {};
    var targetId = cleanId(body.id || '');
    var kind = body.kind === 'teapots' ? 'teapots' : body.kind === 'loyalty' ? 'loyalty' : null;
    var delta = body.delta === -1 ? -1 : 1;
    if (!targetId || !kind) return res.status(400).json({ error: 'Некорректные данные' });

    var rows = kind === 'teapots'
      ? await sql`SELECT teapots AS v FROM accounts WHERE id = ${targetId}`
      : await sql`SELECT loyalty AS v FROM accounts WHERE id = ${targetId}`;
    if (!rows[0]) return res.status(404).json({ error: 'Такой кабинет не найден' });

    var goal = GOALS[kind];
    var cur = rows[0].v || 0;
    var next;
    if (delta > 0) {
      next = cur + 1 > goal ? 0 : cur + 1;
    } else {
      next = Math.max(0, cur - 1);
    }

    if (kind === 'teapots') {
      await sql`UPDATE accounts SET teapots = ${next} WHERE id = ${targetId}`;
    } else {
      await sql`UPDATE accounts SET loyalty = ${next} WHERE id = ${targetId}`;
    }

    var adminRow = await sql`SELECT username FROM accounts WHERE id = ${session.uid}`;
    var adminName = (adminRow[0] && adminRow[0].username) || session.uid;
    await logActivity(
      targetId,
      'loyalty',
      'admin:' + adminName + ' ' + (delta > 0 ? '+1 ' : '-1 ') + LABELS[kind]
    );

    return res.status(200).json({ id: targetId, kind: kind, value: next });
  } catch (e) {
    console.error('admin/drinks error', e);
    return res.status(500).json({ error: e.isSessionError ? e.message : 'Что-то пошло не так' });
  }
}
