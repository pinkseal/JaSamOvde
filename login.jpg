import { sql } from '../../lib/db';
import { IMAGE_KEYS } from '../../lib/settings';

// Отдаёт картинку из настроек (меню, расписание, фото этажей) как обычный файл.
// Ссылка содержит хеш содержимого (v=...), поэтому её можно кэшировать надолго.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  var key = String(req.query.key || '');
  if (IMAGE_KEYS.indexOf(key) === -1) return res.status(404).end();
  try {
    var rows = await sql`SELECT value FROM settings WHERE key = ${key}`;
    var value = rows[0] && rows[0].value;
    var marker = value ? value.indexOf(';base64,') : -1;
    if (marker === -1) return res.status(404).end();
    var mime = value.slice(5, marker);
    if (['image/jpeg', 'image/png', 'image/webp', 'image/gif'].indexOf(mime) === -1) return res.status(404).end();
    var buf = Buffer.from(value.slice(marker + 8), 'base64');
    res.setHeader('Content-Type', mime);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.status(200).send(buf);
  } catch (e) {
    console.error('image error', e);
    return res.status(500).end();
  }
}
