import { cookies } from 'next/headers';
import { SESSION_COOKIE, readBody, errorResponse } from '@/lib/server/http';
import { createSession, deleteSession, HttpError } from '@/lib/server/store';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const body = await readBody(request);
    if (!body || typeof body.email !== 'string' || body.email.length > 254)
      throw new HttpError(400, 'Adresse email invalide.');
    const token = createSession(body.email.trim().toLowerCase());
    const jar = await cookies();
    deleteSession(jar.get(SESSION_COOKIE)?.value);
    jar.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure:
        new URL(process.env.APP_ORIGIN || request.url).protocol === 'https:',
      path: '/',
      maxAge: 8 * 60 * 60,
    });
    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
export async function DELETE(request: Request) {
  try {
    await readBody(request);
    const jar = await cookies();
    deleteSession(jar.get(SESSION_COOKIE)?.value);
    jar.delete(SESSION_COOKIE);
    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
