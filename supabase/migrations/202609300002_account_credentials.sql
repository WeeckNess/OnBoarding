-- Credentials for the app's server-managed sessions. Passwords are scrypt hashes.
create table if not exists public.account_credentials (
  account_id text primary key,
  password_hash text not null,
  password_changed_at timestamptz not null default now()
);

alter table public.account_credentials enable row level security;
revoke all on public.account_credentials from anon, authenticated;
grant all on public.account_credentials to service_role;
