alter table public.onboarding_records
  add column if not exists elearning_sessions jsonb not null default '[]'::jsonb;
