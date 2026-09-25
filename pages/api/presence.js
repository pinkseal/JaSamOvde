import { sql } from '../../lib/db';
import { getSession } from '../../lib/session';

var ZONES = ['top', 'middle', 'basement'];
var MOODS = ['open', 'games', 'company', 'quiet'];

export default async function handler(req, res) {
  var session = await getSession(req, res);

  try {
    if (req.method === 'GET') {
      var rows = await sql`
        SELECT p.id, p.zone, p.mood, p.at, a.nick, a.emoji
        FROM presence p JOIN accounts a ON a.id = p.id
        WHERE p.at > now() - interval '6 hours'
        ORDER BY p.at ASC
      `;
      return res.status(200).json(rows);
    }

    if (!session.uid) return res.status(401).json({ error: 'Не авторизован' });

    if (req.method === 'PUT') {
      var body = req.body || {};
      if (ZONES.indexOf(body.zone) === -1 || MOODS.indexOf(body.mood) === -1) {
        return res.status(400).json({ error: 'Некорректные данные' });
      }
      // ON CONFLICT не трогает "at" — таймер идёт с первой отметки, даже если сменили этаж.
      await sql`
        INSERT INTO presence (id, zone, mood, at) VALUES (${session.uid}, ${body.zone}, ${body.mood}, now())
        ON CONFLICT (id) DO UPDATE SET zone = EXCLUDED.zone, mood = EXCLUDED.mood
      `;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      await sql`DELETE FROM presence WHERE id = ${session.uid}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('presence error', e);
    return res.status(500).json({ error: 'Что-то пошло не так' });
  }
}
