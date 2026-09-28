import { getSession } from '../../../lib/session';
import { requireAdmin } from '../../../lib/activity';
import { getAllSettings, setSettings, validateSettings } from '../../../lib/settings';
import { friendlyDbError } from '../../../lib/dbhint';

export const config = {
  api: { bodyParser: { sizeLimit: '4mb' } },
};

export default async function handler(req, res) {
  try {
    var session = await getSession(req, res);
    if (!session.uid) return res.status(401).json({ error: 'Не авторизован' });
    if (!(await requireAdmin(session.uid))) return res.status(403).json({ error: 'Доступно только администратору' });

    if (req.method === 'GET') {
      return res.status(200).json(await getAllSettings());
    }

    if (req.method === 'PUT') {
      var body = req.body || {};
      var problem = validateSettings(body);
      if (problem) return res.status(400).json({ error: problem });
      await setSettings(body);
      return res.status(200).json(await getAllSettings());
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('admin/settings error', e);
    return res.status(500).json({ error: friendlyDbError(e) });
  }
}
