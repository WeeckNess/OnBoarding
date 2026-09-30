import { applyAction } from '@/lib/server/actions';
import { requireAccount, readBody, errorResponse } from '@/lib/server/http';
export const runtime = 'nodejs';
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const account = await requireAccount();
    const body = await readBody(request);
    const { id } = await context.params;
    return Response.json(applyAction(account, id, body), {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
