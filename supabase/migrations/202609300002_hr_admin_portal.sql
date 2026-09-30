create table if not exists public.admins (
  id text primary key,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  role text not null,
  department text not null,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;
grant all on public.admins to service_role;

alter table public.onboarding_records
  add column if not exists hr_compliance jsonb not null default '{"dpae":"pending","mutuelle":"pending","rib":"pending","identity":"pending","socialSecurity":"pending","itCharter":"pending"}'::jsonb;

insert into public.admins (id, first_name, last_name, email, role, department)
values ('admin-sonia', 'Sonia', 'Mercier', 'sonia.mercier@datainsight.example', 'Responsable RH & Administration', 'Ressources humaines')
on conflict (id) do nothing;
