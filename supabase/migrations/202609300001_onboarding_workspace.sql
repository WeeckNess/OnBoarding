-- Schéma cible Supabase pour le scénario Lucca simulé.
-- Aucun secret ni appel à un projet Supabase n'est requis pour le mode local.

create table if not exists public.managers (
  id text primary key,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  role text not null,
  department text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.admins (
  id text primary key,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  role text not null,
  department text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.employees (
  id text primary key,
  lucca_person_id text not null unique,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  role text not null,
  department text not null,
  manager_id text not null references public.managers(id),
  manager_name text not null,
  buddy_id text not null,
  start_date date not null,
  employment_status text not null check (employment_status in ('active', 'planned')),
  legal_entity text not null,
  office text not null,
  source_system text not null default 'lucca-mock' check (source_system in ('lucca-mock', 'lucca')),
  source_payload jsonb not null default '{}'::jsonb,
  imported_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists employees_manager_idx on public.employees(manager_id);
create index if not exists employees_start_date_idx on public.employees(start_date);

create table if not exists public.roadmap_templates (
  id text primary key,
  day_number integer not null check (day_number between 1 and 30),
  milestone_id text not null check (milestone_id in ('prearrival', 'j1', 's1', 's2', 'j15', 'j30')),
  title text not null,
  description text not null,
  estimated_minutes integer,
  category text not null check (category in ('admin', 'tech', 'team', 'culture', 'project')),
  action_url text,
  action_label text
);

create table if not exists public.onboarding_records (
  employee_id text primary key references public.employees(id) on delete cascade,
  manager_id text not null references public.managers(id),
  version integer not null default 1 check (version > 0),
  hr_compliance jsonb not null default '{"dpae":"pending","mutuelle":"pending","rib":"pending","identity":"pending","socialSecurity":"pending","itCharter":"pending"}'::jsonb,
  welcome jsonb not null default '{"host":"","location":"","time":"09:00","message":""}'::jsonb,
  requests jsonb not null default '[]'::jsonb,
  documents jsonb not null default '[]'::jsonb,
  tasks jsonb not null default '[]'::jsonb,
  completed_task_ids jsonb not null default '[]'::jsonb,
  goals jsonb not null default '[]'::jsonb,
  meetings jsonb not null default '[]'::jsonb,
  blockers jsonb not null default '[]'::jsonb,
  feedback jsonb,
  notifications jsonb not null default '[]'::jsonb,
  activity jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.employee_signatures (
  employee_id text primary key references public.employees(id) on delete cascade,
  signature_data text not null,
  signed_at timestamptz not null default now()
);

create table if not exists public.workspace_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.integration_runs (
  id bigint generated always as identity primary key,
  run_key text not null unique,
  source_system text not null,
  status text not null check (status in ('completed', 'failed')),
  records_read integer not null default 0,
  records_created integer not null default 0,
  records_updated integer not null default 0,
  details jsonb not null default '{}'::jsonb,
  finished_at timestamptz not null default now()
);

create table if not exists public.app_sessions (
  token_hash text primary key,
  account_id text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists app_sessions_expiry_idx on public.app_sessions(expires_at);

-- Le serveur applicatif vérifiera les rôles et le périmètre de chaque dossier.
-- Les navigateurs n'accèdent jamais directement aux tables avec une clé service.
alter table public.managers enable row level security;
alter table public.admins enable row level security;
alter table public.employees enable row level security;
alter table public.roadmap_templates enable row level security;
alter table public.onboarding_records enable row level security;
alter table public.employee_signatures enable row level security;
alter table public.workspace_settings enable row level security;
alter table public.integration_runs enable row level security;
alter table public.app_sessions enable row level security;

revoke all on public.admins, public.managers, public.employees, public.roadmap_templates,
  public.onboarding_records,
  public.employee_signatures, public.workspace_settings,
  public.integration_runs, public.app_sessions from anon, authenticated;
grant all on public.admins, public.managers, public.employees, public.roadmap_templates,
  public.onboarding_records,
  public.employee_signatures, public.workspace_settings,
  public.integration_runs, public.app_sessions to service_role;
grant usage, select on sequence public.integration_runs_id_seq to service_role;
