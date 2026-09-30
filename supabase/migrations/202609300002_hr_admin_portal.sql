create table if not exists public.admins (
  id text primary key,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  role text not null,
  department text not null,
  created_at timestamptz not null default now()
);

alter table public.admins
  add column if not exists app_role text not null default 'admin'
  check (app_role in ('admin', 'rh', 'it'));

alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;
grant all on public.admins to service_role;

alter table public.onboarding_records
  add column if not exists hr_compliance jsonb not null default '{"dpae":"pending","mutuelle":"pending","rib":"pending","identity":"pending","socialSecurity":"pending","itCharter":"pending"}'::jsonb;

create table if not exists public.notification_reads (
  account_id text not null,
  notification_id text not null,
  primary key (account_id, notification_id)
);
alter table public.notification_reads enable row level security;
revoke all on public.notification_reads from anon, authenticated;
grant all on public.notification_reads to service_role;

insert into public.admins (id, first_name, last_name, email, role, department)
values ('admin-sonia', 'Sonia', 'Mercier', 'sonia.mercier@datainsight.example', 'Responsable RH & Administration', 'Ressources humaines')
on conflict (id) do nothing;

update public.admins set app_role = 'admin' where id = 'admin-sonia';
insert into public.admins (id, first_name, last_name, email, role, department, app_role)
values
  ('service-rh', 'Sonia', '', 'rh@datainsight.example', 'Responsable RH', 'Ressources humaines', 'rh'),
  ('service-it', 'Équipe', 'IT', 'it@datainsight.example', 'Support informatique', 'Informatique', 'it')
on conflict (id) do nothing;
