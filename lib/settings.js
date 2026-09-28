import { sql } from './db';

// Текстовые настройки: hours — «Расписание» (несколько строк: часы работы, события недели).
export var TEXT_KEYS = ['hours'];
// Картинки хранятся в базе как data URL, а гостям отдаются отдельной ручкой /api/image
// (с кэшированием) — в списке настроек только короткая ссылка.
export var IMAGE_KEYS = ['menu_image', 'schedule_image', 'zone_img_top', 'zone_img_middle', 'zone_img_basement'];
var KEYS = TEXT_KEYS.concat(IMAGE_KEYS);

export var DATA_URL_RE = /^data:image\/(jpeg|png|webp|gif);base64,/;

export async function getAllSettings() {
  var rows = await sql`
    SELECT key,
           CASE WHEN key = 'hours' THEN value ELSE NULL END AS text,
           coalesce(length(value), 0) AS len,
           left(md5(coalesce(value, '')), 10) AS v
    FROM settings
  `;
  var out = {};
  rows.forEach(function (r) {
    if (r.key === 'hours') {
      out.hours = r.text || '';
    } else if (IMAGE_KEYS.indexOf(r.key) !== -1 && Number(r.len) > 0) {
      out[r.key] = '/api/image?key=' + r.key + '&v=' + r.v;
    }
  });
  return out;
}

// Возвращает текст ошибки, если значение не подходит; иначе null.
export function validateSettings(partial) {
  var keys = Object.keys(partial || {});
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (KEYS.indexOf(key) === -1) continue;
    var value = partial[key] == null ? '' : String(partial[key]);
    if (IMAGE_KEYS.indexOf(key) !== -1 && value !== '' && !DATA_URL_RE.test(value)) {
      return 'Нужна картинка в формате JPG, PNG, WebP или GIF';
    }
    if (value.length > 3 * 1024 * 1024) {
      return 'Файл слишком большой. Сожмите изображение и попробуйте снова.';
    }
  }
  return null;
}

export async function setSettings(partial) {
  var keys = Object.keys(partial || {}).filter(function (k) {
    return KEYS.indexOf(k) !== -1;
  });
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = partial[key] == null ? '' : String(partial[key]);
    if (key === 'hours') value = value.slice(0, 600);
    await sql`
      INSERT INTO settings (key, value) VALUES (${key}, ${value})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;
  }
}
