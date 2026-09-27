import { getIronSession } from 'iron-session';

export const sessionOptions = {
  cookieName: 'yz_session',
  password:
    process.env.SESSION_SECRET ||
    'dev-only-secret-change-me-please-32chars!!', // set SESSION_SECRET in Vercel for real deployments
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 180, // 180 days
  },
};

export async function getSession(req, res) {
  try {
    return await getIronSession(req, res, sessionOptions);
  } catch (e) {
    var err = new Error(
      'Проблема с сессией на сервере: переменная SESSION_SECRET должна быть строкой не короче 32 символов. ' +
        'Проверьте её в Vercel → Settings → Environment Variables, затем сделайте Redeploy.'
    );
    err.isSessionError = true;
    err.cause = e;
    throw err;
  }
}
