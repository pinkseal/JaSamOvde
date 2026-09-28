import { getAllSettings } from '../../lib/settings';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    var settings = await getAllSettings();
    return res.status(200).json(settings);
  } catch (e) {
    console.error('settings error', e);
    return res.status(500).json({ error: 'Что-то пошло не так' });
  }
}
