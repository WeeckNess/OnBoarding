import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

function readEnvFile(path) {
  let content;
  try {
    content = readFileSync(path, 'utf8');
  } catch {
    return {};
  }
  const values = {};
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([^#=\s]+)\s*=\s*(.*?)\s*$/);
    if (match) values[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
  return values;
}

const databaseUrl =
  process.env.SUPABASE_DB_URL || readEnvFile('.env.local').SUPABASE_DB_URL;
if (!databaseUrl) {
  console.error(
    'Ajoutez SUPABASE_DB_URL dans .env.local (Project Settings → Database → Connection string → URI), puis relancez npm run db:push.'
  );
  process.exit(1);
}

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(
  npx,
  ['supabase', 'db', 'push', '--db-url', databaseUrl, '--include-seed'],
  { stdio: 'inherit' }
);
if (result.error) {
  console.error(`Impossible de lancer Supabase CLI : ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
