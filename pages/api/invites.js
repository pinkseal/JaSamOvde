import { sql } from '../../lib/db';
import { getSession } from '../../lib/session';
import { newId } from '../../lib/ids';

export default async function handler(req, res) {
  var session = await getSession(req, res);

  try {
    if (req.method === 'GET') {
      var rows = await sql`
        SELECT i.id, i.uid, i.text, i.date, i.time, i.created_at, a.nick, a.emoji
        FROM invites i JOIN accounts a ON a.id = i.uid
        WHERE (i.date || ' ' || i.time)::timestamp > (now() - interval '24 hours')
        ORDER BY (i.date || ' ' || i.time)::timestamp ASC
      `;
      return res.status(200).json(rows);
    }

    if (!session.uid) return res.status(401).json({ error: 'Не авторизован' });

    if (req.method === 'POST') {
      var body = req.body || {};
      var text = String(body.text || '').trim().slice(0, 220);
      var date = String(body.date || '');
      var time = String(body.time || '');
      if (!text) return res.status(400).json({ error: 'Добавьте текст приглашения' });
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
        return res.status(400).json({ error: 'Некорректная дата или время' });
      }
      var id = newId('i');
      await sql`INSERT INTO invites (id, uid, text, date, time, created_at) VALUES (${id}, ${session.uid}, ${text}, ${date}, ${time}, now())`;
      return res.status(200).json({ id: id });
    }

    if (req.method === 'DELETE') {
      var delId = req.query.id;
      if (!delId) return res.status(400).json({ error: 'Не хватает id' });
      await sql`DELETE FROM invites WHERE id = ${delId} AND uid = ${session.uid}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('invites error', e);
    return res.status(500).json({ error: 'Что-то пошло не так' });
  }
}
