import { cookies } from 'next/headers';
import { HttpError, sessionAccount } from './store';

export const SESSION_COOKIE = 'midi_demo_session';
export async function getAccount() {
  return sessionAccount((await cookies()).get(SESSION_COOKIE)?.value);
}
export async function requireAccount() {
  const account = await getAccount();
  if (!account)
    throw new HttpError(401, 'Connectez-vous à un profil de démonstration.');
  return account;
}
export async function readBody(request: Request) {
  const origin = request.headers.get('origin');
  // Next may normalize request.url to localhost. Host retains the public authority.
  const expectedOrigin =
    process.env.APP_ORIGIN ||
    `${new URL(request.url).protocol}//${request.headers.get('host')}`;
  if (!origin || origin !== expectedOrigin)
    throw new HttpError(403, 'Origine de la requête refusée.');
  if (!request.headers.get('content-type')?.includes('application/json'))
    throw new HttpError(415, 'Format JSON requis.');
  if (Number(request.headers.get('content-length')) > 200000)
    throw new HttpError(413, 'Requête trop volumineuse.');
  const raw = await request.text();
  if (raw.length > 200000)
    throw new HttpError(413, 'Requête trop volumineuse.');
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, 'JSON invalide.');
  }
}
export function errorResponse(error: unknown) {
  if (error instanceof HttpError)
    return Response.json({ error: error.message }, { status: error.status });
  console.error('Onboarding API error', error);
  return Response.json(
    { error: 'Enregistrement indisponible. Réessayez.' },
    { status: 500 }
  );
}
