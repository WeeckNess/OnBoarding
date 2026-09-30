-- Jeu entièrement fictif : 50 salariés au répertoire, objectif de 70 fin 2027.
-- Les emails utilisent datainsight.example et ne peuvent pas recevoir de courrier.

insert into public.managers (id, first_name, last_name, email, role, department)
values
  ('manager-antoine', 'Antoine', 'Laurent', 'antoine.laurent@datainsight.example', 'Head of Data', 'Data Platform'),
  ('manager-claire', 'Claire', 'Vasseur', 'claire.vasseur@datainsight.example', 'VP Engineering', 'Data Analytics'),
  ('manager-julien', 'Julien', 'Mercier', 'julien.mercier@datainsight.example', 'Engineering Manager', 'Data Applications'),
  ('manager-ines', 'Inès', 'Bernard', 'ines.bernard@datainsight.example', 'Head of Product', 'Data Product'),
  ('manager-camille', 'Camille', 'Robert', 'camille.robert@datainsight.example', 'Directrice des opérations', 'Opérations')
on conflict (id) do nothing;

insert into public.admins (id, first_name, last_name, email, role, department)
values ('admin-sonia', 'Sonia', 'Mercier', 'sonia.mercier@datainsight.example', 'Responsable RH & Administration', 'Ressources humaines')
on conflict (id) do nothing;

with source_people as (
  select
    n,
    (array['Léa', 'Noé', 'Maya', 'Adam', 'Inès', 'Hugo', 'Lina', 'Sami', 'Jade', 'Elias'])[((n - 1) / 5) + 1] as first_name,
    (array['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Morel', 'Girard', 'André', 'Lefevre', 'Mercier', 'Dupont', 'Lambert', 'Bonnet', 'François', 'Martinez', 'Legrand', 'Garnier', 'Faure', 'Rousseau', 'Blanc', 'Guérin', 'Muller', 'Henry', 'Roussel', 'Nicolas', 'Perrin', 'Morin', 'Mathieu', 'Clément', 'Gauthier', 'Dumont', 'Lopez', 'Fontaine', 'Chevalier', 'Robin', 'Masson'])[((n - 1) * 7 % 50) + 1] as last_name,
    (array['Data Platform', 'Data Analytics', 'Data Applications', 'Data Product', 'Opérations'])[((n - 1) % 5) + 1] as department,
    (array['manager-antoine', 'manager-claire', 'manager-julien', 'manager-ines', 'manager-camille'])[((n - 1) % 5) + 1] as manager_id,
    (array['Head of Data', 'VP Engineering', 'Engineering Manager', 'Head of Product', 'Directrice des opérations'])[((n - 1) % 5) + 1] as manager_role,
    case when n % 2 = 0 then 'buddy-camille' else 'buddy-julien' end as buddy_id,
    (array['Data Engineer', 'Analytics Engineer', 'Développeur Data', 'Product Analyst', 'Operations Manager', 'Data Analyst', 'Platform Engineer', 'Product Manager', 'Data Scientist', 'Responsable opérations'])[ ((n - 1) % 10) + 1 ] as job_title
  from generate_series(1, 50) as n
), prepared as (
  select
    'emp-' || lpad(n::text, 2, '0') as id,
    'LUCCA-MOCK-' || lpad(n::text, 3, '0') as lucca_person_id,
    first_name,
    last_name,
    lower(translate(first_name, 'ÉéÈèÊêËëÀàÂâÄäÎîÏïÔôÖöÙùÛûÜüÇç', 'EeEeEeEeAaAaAaIiIiOoOoUuUuUuCc'))
      || '.' || lower(last_name) || '.' || lpad(n::text, 2, '0') || '@datainsight.example' as email,
    job_title,
    department,
    manager_id,
    manager_role,
    buddy_id,
    case when n <= 10 then current_date + ((n - 1) * 6 + 1) else current_date - ((n - 10) * 8) end as start_date,
    case when n <= 10 then 'planned' else 'active' end as employment_status,
    n
  from source_people
)
insert into public.employees (
  id, lucca_person_id, first_name, last_name, email, role, department,
  manager_id, manager_name, buddy_id, start_date, employment_status, legal_entity,
  office, source_payload
)
select
  p.id,
  p.lucca_person_id,
  p.first_name,
  p.last_name,
  p.email,
  p.job_title,
  p.department,
  p.manager_id,
  m.first_name || ' ' || m.last_name || ' (' || p.manager_role || ')',
  p.buddy_id,
  p.start_date,
  p.employment_status,
  'Data Insight SAS',
  'Paris',
  jsonb_build_object('source', 'lucca-mock', 'sourcePersonId', p.lucca_person_id, 'scenario', true)
from prepared p
join public.managers m on m.id = p.manager_id
on conflict (id) do update set
  lucca_person_id = excluded.lucca_person_id,
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  email = excluded.email,
  role = excluded.role,
  department = excluded.department,
  manager_id = excluded.manager_id,
  manager_name = excluded.manager_name,
  buddy_id = excluded.buddy_id,
  start_date = excluded.start_date,
  employment_status = excluded.employment_status,
  legal_entity = excluded.legal_entity,
  office = excluded.office,
  source_payload = excluded.source_payload,
  updated_at = now();

insert into public.roadmap_templates (id, day_number, milestone_id, title, description, estimated_minutes, category, action_url, action_label)
values
  ('task-j1-1', 1, 'j1', 'Vérification et signature électronique du contrat', 'Consulter le contrat de travail et l’accord de confidentialité puis signer.', 10, 'admin', '/contracts', 'Signer mon contrat'),
  ('task-j1-2', 1, 'j1', 'Déballage et configuration du poste', 'Allumer le poste préconfiguré et synchroniser les outils de travail.', 30, 'tech', '/codex', 'Guide installation IT'),
  ('task-j1-3', 1, 'j1', 'Café d’accueil avec le buddy', 'Faire connaissance, poser les questions pratiques et découvrir le bureau.', 20, 'team', '/buddy', 'Voir le buddy'),
  ('task-j1-4', 1, 'j1', 'Présentation à l’équipe', 'Écrire un message de bienvenue à l’ensemble de l’équipe.', 10, 'culture', null, null),
  ('task-j1-5', 1, 'j1', 'Photo de profil et badge', 'Valider le badge et ajouter une photo aux outils internes.', 15, 'admin', null, null),
  ('task-s1-1', 2, 's1', 'Configuration de l’environnement data', 'Cloner le dépôt et vérifier les outils de développement.', 60, 'tech', '/codex', 'Documentation technique'),
  ('task-s1-2', 3, 's1', 'Lecture du Codex Data Insight', 'Comprendre les activités, les équipes et les indicateurs de l’entreprise.', 40, 'culture', '/codex', 'Lire le Codex'),
  ('task-s1-3', 4, 's1', 'Pair programming avec le buddy', 'Découvrir le workflow de développement avec un membre de l’équipe.', 60, 'tech', '/buddy', 'Contacter le buddy'),
  ('task-s1-4', 5, 's1', 'Déjeuner d’équipe et premier bilan', 'Partager le déjeuner et faire le point sur la première semaine.', 90, 'team', null, null),
  ('task-s2-1', 6, 's2', 'Premier ticket de l’équipe', 'Prendre un ticket de découverte validé lors du sprint planning.', 30, 'project', null, null),
  ('task-s2-2', 8, 's2', 'Première Pull Request', 'Créer une PR, recevoir la revue des pairs et intégrer les retours.', 120, 'tech', null, null),
  ('task-s2-3', 10, 's2', 'Sprint Review et rétrospective', 'Découvrir les rituels agiles de l’équipe.', 60, 'team', null, null),
  ('task-j15-1', 12, 'j15', 'Rencontre avec les équipes partenaires', 'Comprendre comment les équipes utilisent les données.', 45, 'team', null, null),
  ('task-j15-2', 15, 'j15', 'Rapport d’étonnement', 'Noter les observations et les suggestions après les premières semaines.', 45, 'culture', '/codex', 'Modèle de rapport'),
  ('task-j15-3', 16, 'j15', 'Point de mi-parcours avec le manager', 'Faire le bilan des quinze premiers jours et fixer les objectifs du mois.', 45, 'team', null, null),
  ('task-j30-1', 22, 'j30', 'Gestion autonome d’un pipeline', 'Réaliser un pipeline de données de bout en bout.', 180, 'project', null, null),
  ('task-j30-2', 28, 'j30', 'Choix d’une formation continue', 'Choisir une certification ou une ressource de formation pertinente.', 30, 'culture', null, null),
  ('task-j30-3', 30, 'j30', 'Bilan et clôture de l’intégration', 'Faire le point final d’intégration avec l’équipe.', 60, 'admin', null, null)
on conflict (id) do nothing;

insert into public.onboarding_records (employee_id, manager_id, welcome, requests, documents, tasks, completed_task_ids, goals, meetings, blockers, notifications, activity)
select
  e.id,
  e.manager_id,
  jsonb_build_object(
    'host', case when e.employment_status = 'active' then split_part(e.manager_name, ' (', 1) else '' end,
    'location', case when e.employment_status = 'active' then e.office else '' end,
    'time', '09:00',
    'message', case when e.employment_status = 'active' then 'Bienvenue chez Data Insight, ' || e.first_name || ' !' else '' end
  ),
  jsonb_build_array(
    jsonb_build_object('id', e.id || '-laptop', 'kind', 'hardware', 'title', 'Ordinateur portable', 'owner', 'IT', 'dueDate', e.start_date - 2, 'status', case when e.employment_status = 'active' then 'ready' else 'in_progress' end, 'blocking', true),
    jsonb_build_object('id', e.id || '-access', 'kind', 'access', 'title', 'Accès aux outils et dépôts', 'owner', 'IT', 'dueDate', e.start_date - 1, 'status', case when e.employment_status = 'active' then 'ready' else 'requested' end, 'blocking', true)
  ),
  case when e.employment_status = 'active' and current_date - e.start_date > 1 and right(e.id, 2)::integer % 5 <> 0 then
    '[{"id":"contract","title":"Contrat de travail","status":"signed"},{"id":"nda","title":"Accord de confidentialité","status":"signed"}]'::jsonb
  else
    '[{"id":"contract","title":"Contrat de travail","status":"pending"},{"id":"nda","title":"Accord de confidentialité","status":"pending"}]'::jsonb
  end,
  coalesce(task_data.tasks, '[]'::jsonb),
  coalesce(task_data.completed_ids, '[]'::jsonb),
  '[]'::jsonb,
  jsonb_build_array(
    jsonb_build_object('id', 'meeting-1', 'title', 'Accueil J1', 'dueDate', e.start_date, 'done', e.start_date < current_date, 'notes', ''),
    jsonb_build_object('id', 'meeting-7', 'title', 'Point J+7', 'dueDate', e.start_date + 7, 'done', current_date - e.start_date >= 7, 'notes', ''),
    jsonb_build_object('id', 'meeting-30', 'title', 'Point J+30', 'dueDate', e.start_date + 30, 'done', current_date - e.start_date >= 30, 'notes', '')
  ),
  '[]'::jsonb,
  '[]'::jsonb,
  jsonb_build_array(jsonb_build_object('actor', 'Lucca · annuaire simulé', 'label', 'Fiche salariée importée dans le scénario', 'createdAt', now()))
from public.employees e
join lateral (
  select
    jsonb_agg(
      jsonb_build_object(
        'id', t.id,
        'title', t.title,
        'description', t.description,
        'dayNumber', t.day_number,
        'milestoneId', t.milestone_id,
        'estimatedMinutes', t.estimated_minutes,
        'category', t.category,
        'actionUrl', t.action_url,
        'actionLabel', t.action_label,
        'owner', 'employee',
        'dueDate', e.start_date + t.day_number - 1
      ) order by t.day_number, t.id
    ) as tasks,
    jsonb_agg(to_jsonb(t.id) order by t.day_number, t.id) filter (
      where e.start_date < current_date
        and t.day_number <= least(current_date - e.start_date, 30)
        and (t.id <> 'task-j1-1' or (current_date - e.start_date > 1 and right(e.id, 2)::integer % 5 <> 0))
    ) as completed_ids
  from public.roadmap_templates t
) task_data on true
on conflict (employee_id) do nothing;

insert into public.workspace_settings (key, value)
values ('headcount_projection', '{"baseline":50,"target":70,"targetDate":"2027-12-31","source":"scenario-fictif"}'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();

insert into public.integration_runs (run_key, source_system, status, records_read, records_created, details)
values ('lucca-mock-initial-seed', 'lucca-mock', 'completed', 50, 50, '{"mode":"local seed","externalConnection":false}'::jsonb)
on conflict (run_key) do update
set status = excluded.status,
    records_read = excluded.records_read,
    records_created = excluded.records_created,
    details = excluded.details,
    finished_at = now();
