import { getSession } from '../../lib/session';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    var session = await getSession(req, res);
    session.destroy();
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('logout error', e);
    return res.status(500).json({ error: e.isSessionError ? e.message : 'Что-то пошло не так' });
  }
}
