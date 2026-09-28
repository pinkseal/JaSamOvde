import { sql } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    var rows = await sql`SELECT id, title, body, created_at FROM announcements ORDER BY created_at DESC LIMIT 20`;
    return res.status(200).json(rows);
  } catch (e) {
    console.error('announcements error', e);
    return res.status(500).json({ error: 'Что-то пошло не так' });
  }
}
