import { getAccount, errorResponse } from '@/lib/server/http';
import { recordsFor } from '@/lib/server/store';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const account = await getAccount();
    return Response.json(
      {
        account,
        records: account ? await recordsFor(account) : [],
        features: {
          demoReset: process.env.DEMO_RESET_ENABLED === 'true',
          profileSwitch:
            process.env.DEMO_ACCESS_ENABLED !== 'false' &&
            (process.env.DEMO_PROFILE_SWITCH_ENABLED === 'true' ||
              process.env.NODE_ENV !== 'production'),
        },
      },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (error) {
    return errorResponse(error);
  }
}
