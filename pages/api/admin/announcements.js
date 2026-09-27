import { sql } from '../../../lib/db';
import { getSession } from '../../../lib/session';
import { requireAdmin } from '../../../lib/activity';
import { newId } from '../../../lib/ids';

export default async function handler(req, res) {
  try {
    var session = await getSession(req, res);
    if (!session.uid) return res.status(401).json({ error: 'Не авторизован' });
    if (!(await requireAdmin(session.uid))) return res.status(403).json({ error: 'Доступно только администратору' });

    if (req.method === 'GET') {
      var rows = await sql`SELECT id, title, body, created_at FROM announcements ORDER BY created_at DESC`;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      var reqBody = req.body || {};
      var title = String(reqBody.title || '').trim().slice(0, 100);
      var body = String(reqBody.body || '').trim().slice(0, 600);
      if (!title || !body) return res.status(400).json({ error: 'Заполните заголовок и текст' });
      var id = newId('n');
      await sql`INSERT INTO announcements (id, title, body, created_at) VALUES (${id}, ${title}, ${body}, now())`;
      return res.status(200).json({ id: id });
    }

    if (req.method === 'DELETE') {
      var delId = req.query.id;
      if (!delId) return res.status(400).json({ error: 'Не хватает id' });
      await sql`DELETE FROM announcements WHERE id = ${delId}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('admin/announcements error', e);
    return res.status(500).json({ error: e.isSessionError ? e.message : 'Что-то пошло не так' });
  }
}
