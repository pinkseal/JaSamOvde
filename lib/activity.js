import { sql } from './db';
import { newId } from './ids';

export async function requireAdmin(uid) {
  var rows = await sql`SELECT is_admin FROM accounts WHERE id = ${uid}`;
  return !!(rows[0] && rows[0].is_admin);
}

export async function logActivity(accountId, kind, detail) {
  try {
    var id = newId('a');
    await sql`INSERT INTO activity (id, account_id, kind, detail, at) VALUES (${id}, ${accountId}, ${kind}, ${detail || null}, now())`;
  } catch (e) {
    // Журнал не должен ломать основное действие пользователя, даже если сам лог не записался.
    console.error('activity log error', e);
  }
}
