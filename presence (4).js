import { sql } from '../../../lib/db';
import { getSession } from '../../../lib/session';
import { requireAdmin, logActivity } from '../../../lib/activity';
import { cleanId } from '../../../lib/ids';

var ZONES = ['top', 'middle', 'basement'];
var MOODS = ['open', 'games', 'company', 'quiet'];

export default async function handler(req, res) {
  try {
    var session = await getSession(req, res);
    if (!session.uid) return res.status(401).json({ error: 'Не авторизован' });
    if (!(await requireAdmin(session.uid))) return res.status(403).json({ error: 'Доступно только администратору' });

    if (req.method === 'POST') {
      var body = req.body || {};
      var targetId = cleanId(body.id || '');
      if (ZONES.indexOf(body.zone) === -1 || MOODS.indexOf(body.mood) === -1 || !targetId) {
        return res.status(400).json({ error: 'Некорректные данные' });
      }
      var acc = await sql`SELECT id FROM accounts WHERE id = ${targetId}`;
      if (!acc[0]) return res.status(404).json({ error: 'Такой кабинет не найден' });

      await sql`
        INSERT INTO presence (id, zone, mood, at) VALUES (${targetId}, ${body.zone}, ${body.mood}, now())
        ON CONFLICT (id) DO UPDATE SET zone = EXCLUDED.zone, mood = EXCLUDED.mood
      `;
      await logActivity(targetId, 'checkin', body.zone + ' (добавлено администратором)');
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      var delId = cleanId(req.query.id || '');
      if (!delId) return res.status(400).json({ error: 'Не хватает id' });
      await sql`DELETE FROM presence WHERE id = ${delId}`;
      await logActivity(delId, 'leave', 'убрано администратором');
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('admin/presence error', e);
    return res.status(500).json({ error: e.isSessionError ? e.message : 'Что-то пошло не так' });
  }
}
