import { sql } from './db';

var KEYS = ['hours', 'menu_image', 'zone_img_top', 'zone_img_middle', 'zone_img_basement'];

export async function getAllSettings() {
  var rows = await sql`SELECT key, value FROM settings`;
  var out = {};
  rows.forEach(function (r) {
    out[r.key] = r.value;
  });
  return out;
}

export async function setSettings(partial) {
  var entries = Object.keys(partial || {}).filter(function (k) {
    return KEYS.indexOf(k) !== -1;
  });
  for (var i = 0; i < entries.length; i++) {
    var key = entries[i];
    var value = partial[key] == null ? null : String(partial[key]);
    await sql`
      INSERT INTO settings (key, value) VALUES (${key}, ${value})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;
  }
}
