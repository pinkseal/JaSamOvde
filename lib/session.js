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

export function getSession(req, res) {
  return getIronSession(req, res, sessionOptions);
}
