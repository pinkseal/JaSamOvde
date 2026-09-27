import { getSession } from '../../../lib/session';
import { requireAdmin } from '../../../lib/activity';
import { getAllSettings, setSettings } from '../../../lib/settings';

export const config = {
  api: { bodyParser: { sizeLimit: '4mb' } },
};

export default async function handler(req, res) {
  try {
    var session = await getSession(req, res);
    if (!session.uid) return res.status(401).json({ error: 'Не авторизован' });
    if (!(await requireAdmin(session.uid))) return res.status(403).json({ error: 'Доступно только администратору' });

    if (req.method === 'GET') {
      var settings = await getAllSettings();
      return res.status(200).json(settings);
    }

    if (req.method === 'PUT') {
      var body = req.body || {};
      // Изображения — data URL целиком; ограничим размер тела, чтобы не раздувать базу.
      var tooBig = Object.keys(body).some(function (k) {
        return typeof body[k] === 'string' && body[k].length > 3 * 1024 * 1024;
      });
      if (tooBig) return res.status(413).json({ error: 'Файл слишком большой. Сожмите изображение и попробуйте снова.' });
      await setSettings(body);
      var updated = await getAllSettings();
      return res.status(200).json(updated);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('admin/settings error', e);
    return res.status(500).json({ error: e.isSessionError ? e.message : 'Что-то пошло не так' });
  }
}
