import { sql } from '../../lib/db';
import { getSession } from '../../lib/session';
import { genPersona } from '../../lib/persona';

var LOYALTY_GOAL = 8;

export default async function handler(req, res) {
  var session = await getSession(req, res);
  if (!session.uid) return res.status(401).json({ error: 'Не авторизован' });

  try {
    if (req.method === 'GET') {
      var rows = await sql`SELECT id, username, nick, emoji, loyalty FROM accounts WHERE id = ${session.uid}`;
      if (!rows[0]) return res.status(401).json({ error: 'Не авторизован' });
      return res.status(200).json(rows[0]);
    }

    if (req.method === 'PUT') {
      var body = req.body || {};

      if (body.action === 'reroll') {
        var persona = genPersona();
        await sql`UPDATE accounts SET nick = ${persona.nick}, emoji = ${persona.emoji} WHERE id = ${session.uid}`;
        return res.status(200).json(persona);
      }

      if (body.action === 'loyalty-plus') {
        var cur = await sql`SELECT loyalty FROM accounts WHERE id = ${session.uid}`;
        var val = (cur[0] && cur[0].loyalty) || 0;
        var next = val >= LOYALTY_GOAL ? 0 : val + 1;
        await sql`UPDATE accounts SET loyalty = ${next} WHERE id = ${session.uid}`;
        return res.status(200).json({ loyalty: next });
      }

      return res.status(400).json({ error: 'Неизвестное действие' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('me error', e);
    return res.status(500).json({ error: 'Что-то пошло не так' });
  }
}
