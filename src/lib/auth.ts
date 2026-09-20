import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

const SESSION_COOKIE = 'restaurant_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

interface Session {
  userId: string;
  role: string;
  expiresAt: number;
}

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error('Admin session configuration is missing.');
  return secret;
}

function sign(payload: string) {
  return createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
}

export function createSessionToken(userId: string, role: string) {
  const payload = Buffer.from(JSON.stringify({
    userId,
    role,
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
  })).toString('base64url');

  return `${payload}.${sign(payload)}`;
}

function readSession(token: string): Session | null {
  const [payload, signature, ...extra] = token.split('.');
  if (!payload || !signature || extra.length > 0) return null;

  try {
    const expectedSignature = Buffer.from(sign(payload));
    const receivedSignature = Buffer.from(signature);
    if (
      expectedSignature.length !== receivedSignature.length ||
      !timingSafeEqual(expectedSignature, receivedSignature)
    ) {
      return null;
    }

    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Session;
    if (
      typeof session.userId !== 'string' ||
      typeof session.role !== 'string' ||
      typeof session.expiresAt !== 'number' ||
      session.expiresAt <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export function requireOwner(request: Request) {
  const cookies = request.headers.get('cookie')?.split(';') ?? [];
  const sessionCookie = cookies
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${SESSION_COOKIE}=`));

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  let session: Session | null;
  try {
    session = readSession(decodeURIComponent(sessionCookie.slice(SESSION_COOKIE.length + 1)));
  } catch {
    session = null;
  }

  if (!session) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }
  if (session.role !== 'OWNER') {
    return NextResponse.json({ error: 'Owner access required.' }, { status: 403 });
  }

  return null;
}
