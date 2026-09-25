export function cleanId(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_.-]/g, '_')
    .slice(0, 40);
}

export function newId(prefix) {
  var rnd =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 20)
      : Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  return prefix + '_' + rnd;
}
