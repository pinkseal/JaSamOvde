// Понятное сообщение, если в базе ещё нет нужной таблицы (не выполнены SQL-команды).
export function friendlyDbError(e, fallback) {
  var msg = String((e && e.message) || '');
  if (/relation .* does not exist/i.test(msg) || /column .* does not exist/i.test(msg)) {
    return 'В базе не хватает таблицы или поля. Выполните SQL-команды из schema.sql в Neon (Query) и повторите.';
  }
  if (e && e.isSessionError) return e.message;
  return fallback || 'Что-то пошло не так';
}
