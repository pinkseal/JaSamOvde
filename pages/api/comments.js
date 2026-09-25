import { sql } from '../../lib/db';
import { getSession } from '../../lib/session';
import { newId } from '../../lib/ids';

export default async function handler(req, res) {
  var session = await getSession(req, res);

  try {
    if (req.method === 'GET') {
      var rows = await sql`
        SELECT c.id, c.invite_id, c.uid, c.text, c.at, a.nick, a.emoji
        FROM comments c JOIN accounts a ON a.id = c.uid
        ORDER BY c.at ASC
      `;
      return res.status(200).json(rows);
    }

    if (!session.uid) return res.status(401).json({ error: 'Не авторизован' });

    if (req.method === 'POST') {
      var body = req.body || {};
      var text = String(body.text || '').trim().slice(0, 140);
      var inviteId = String(body.inviteId || '');
      if (!text || !inviteId) return res.status(400).json({ error: 'Пустой комментарий' });
      var id = newId('c');
      await sql`INSERT INTO comments (id, invite_id, uid, text, at) VALUES (${id}, ${inviteId}, ${session.uid}, ${text}, now())`;
      return res.status(200).json({ id: id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('comments error', e);
    return res.status(500).json({ error: 'Что-то пошло не так' });
  }
}
