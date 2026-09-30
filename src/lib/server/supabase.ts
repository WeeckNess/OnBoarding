import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const globalClient = globalThis as typeof globalThis & {
  dataInsightSupabase?: { url: string; client: SupabaseClient };
};

export function supabaseIsConfigured() {
  return Boolean(
    process.env.SUPABASE_URL &&
      (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)
  );
}

export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Configuration serveur Supabase incomplète.');
  if (globalClient.dataInsightSupabase?.url === url)
    return globalClient.dataInsightSupabase.client;
  const client = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
  globalClient.dataInsightSupabase = { url, client };
  return client;
}
