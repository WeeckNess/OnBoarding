-- Forward repair for projects where the HR/admin migration predates reminder-read persistence.
create table if not exists public.notification_reads (
  account_id text not null,
  notification_id text not null,
  primary key (account_id, notification_id)
);

alter table public.notification_reads enable row level security;
revoke all on public.notification_reads from anon, authenticated;
grant all on public.notification_reads to service_role;
