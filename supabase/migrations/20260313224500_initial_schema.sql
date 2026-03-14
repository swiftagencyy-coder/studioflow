begin;

create extension if not exists pgcrypto;
create extension if not exists citext;

create schema if not exists app;

create type public.app_role as enum ('agency_owner', 'team_member', 'client');
create type public.client_status as enum ('active', 'archived');
create type public.project_status as enum (
  'lead',
  'onboarding',
  'in_progress',
  'waiting_on_client',
  'review',
  'approved',
  'completed'
);
create type public.file_category as enum (
  'logo',
  'brand_asset',
  'document',
  'deliverable',
  'reference',
  'onboarding_asset'
);
create type public.file_visibility as enum ('internal', 'client');
create type public.proposal_status as enum ('draft', 'sent', 'accepted', 'rejected');
create type public.approval_status as enum ('pending', 'approved', 'changes_requested');
create type public.revision_priority as enum ('low', 'medium', 'high', 'urgent');
create type public.revision_status as enum ('open', 'in_review', 'in_progress', 'resolved');
create type public.invoice_status as enum ('draft', 'sent', 'paid', 'overdue');
create type public.activity_action as enum (
  'client_created',
  'client_updated',
  'project_created',
  'project_updated',
  'onboarding_requested',
  'onboarding_submitted',
  'file_uploaded',
  'proposal_created',
  'proposal_sent',
  'proposal_accepted',
  'proposal_rejected',
  'approval_requested',
  'approval_approved',
  'approval_changes_requested',
  'revision_submitted',
  'revision_updated',
  'invoice_created',
  'invoice_updated'
);
create type public.activity_visibility as enum ('internal', 'client');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email citext not null unique,
  full_name text not null,
  avatar_url text,
  default_role public.app_role not null default 'client',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug citext not null unique,
  owner_user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  archived_at timestamptz
);

create table public.agency_members (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.app_role not null,
  title text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  constraint agency_members_internal_roles check (role in ('agency_owner', 'team_member')),
  constraint agency_members_unique unique (agency_id, user_id),
  constraint agency_members_user_single_agency unique (user_id)
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies (id) on delete cascade,
  name text not null,
  contact_name text not null,
  email citext not null,
  phone text,
  tags text[] not null default '{}',
  status public.client_status not null default 'active',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  archived_at timestamptz,
  constraint clients_email_per_agency unique (agency_id, email)
);

create table public.client_private_details (
  client_id uuid primary key references public.clients (id) on delete cascade,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.client_users (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text,
  is_primary boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  constraint client_users_unique unique (client_id, user_id),
  constraint client_users_user_single_client unique (user_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies (id) on delete cascade,
  client_id uuid not null references public.clients (id) on delete cascade,
  name text not null,
  description text,
  status public.project_status not null default 'lead',
  due_date date,
  service_type text not null,
  portal_summary text,
  onboarding_requested_at timestamptz,
  onboarding_completed_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  archived_at timestamptz
);

create table public.project_private_details (
  project_id uuid primary key references public.projects (id) on delete cascade,
  internal_notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.onboarding_submissions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects (id) on delete cascade,
  submitted_by uuid references public.profiles (id) on delete set null,
  business_description text not null,
  target_audience text not null,
  design_style_preferences text,
  competitor_examples text[] not null default '{}',
  required_pages text,
  brand_colors text[] not null default '{}',
  font_preferences text,
  deadlines text,
  extra_notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.uploaded_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  uploaded_by uuid references public.profiles (id) on delete set null,
  uploader_name text not null,
  bucket text not null,
  storage_path text not null unique,
  file_name text not null,
  mime_type text,
  size_bytes bigint not null default 0 check (size_bytes >= 0),
  category public.file_category not null,
  visibility public.file_visibility not null default 'client',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  scope text not null,
  deliverables text not null,
  pricing_total numeric(12, 2) not null default 0 check (pricing_total >= 0),
  timeline text not null,
  revision_count integer not null default 1 check (revision_count >= 0),
  notes text,
  status public.proposal_status not null default 'draft',
  response_message text,
  created_by uuid references public.profiles (id) on delete set null,
  sent_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.proposal_items (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals (id) on delete cascade,
  label text not null,
  description text,
  quantity numeric(10, 2) not null default 1 check (quantity > 0),
  unit_price numeric(12, 2) not null default 0 check (unit_price >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  message text,
  deliverable_file_id uuid references public.uploaded_files (id) on delete set null,
  status public.approval_status not null default 'pending',
  requested_by uuid references public.profiles (id) on delete set null,
  requested_by_name text not null,
  requested_at timestamptz not null default timezone('utc', now()),
  responded_at timestamptz,
  response_message text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.revision_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  approval_request_id uuid references public.approval_requests (id) on delete set null,
  title text not null,
  description text not null,
  priority public.revision_priority not null default 'medium',
  status public.revision_status not null default 'open',
  submitted_by uuid references public.profiles (id) on delete set null,
  submitted_by_name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  resolved_at timestamptz
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  invoice_number text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  due_date date not null,
  status public.invoice_status not null default 'draft',
  note text,
  issued_at timestamptz,
  paid_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects (id) on delete cascade,
  client_id uuid references public.clients (id) on delete cascade,
  actor_user_id uuid references public.profiles (id) on delete set null,
  actor_name text not null,
  entity_type text not null,
  entity_id uuid not null,
  action public.activity_action not null,
  visibility public.activity_visibility not null default 'internal',
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  constraint activity_logs_scope_check check (project_id is not null or client_id is not null)
);

create index agency_members_user_id_idx on public.agency_members (user_id);
create index agency_members_agency_id_idx on public.agency_members (agency_id);
create index clients_agency_id_idx on public.clients (agency_id);
create index clients_status_idx on public.clients (agency_id, status);
create index client_users_user_id_idx on public.client_users (user_id);
create index client_users_client_id_idx on public.client_users (client_id);
create index projects_agency_id_idx on public.projects (agency_id);
create index projects_client_id_idx on public.projects (client_id);
create index projects_status_idx on public.projects (agency_id, status);
create index onboarding_submissions_project_id_idx on public.onboarding_submissions (project_id);
create index uploaded_files_project_id_idx on public.uploaded_files (project_id, created_at desc);
create index uploaded_files_category_idx on public.uploaded_files (project_id, category, visibility);
create index proposals_project_id_idx on public.proposals (project_id, status);
create index proposal_items_proposal_id_idx on public.proposal_items (proposal_id, sort_order);
create index approval_requests_project_id_idx on public.approval_requests (project_id, status);
create index revision_requests_project_id_idx on public.revision_requests (project_id, status);
create index invoices_project_id_idx on public.invoices (project_id, status);
create unique index invoices_project_number_idx on public.invoices (project_id, invoice_number);
create index activity_logs_scope_idx on public.activity_logs (project_id, client_id, visibility, created_at desc);

create or replace function app.refresh_proposal_total()
returns trigger
language plpgsql
as $$
declare
  target_proposal_id uuid;
begin
  target_proposal_id := coalesce(new.proposal_id, old.proposal_id);

  update public.proposals
  set pricing_total = coalesce((
    select sum(item.quantity * item.unit_price)
    from public.proposal_items item
    where item.proposal_id = target_proposal_id
  ), 0)
  where id = target_proposal_id;

  return coalesce(new, old);
end;
$$;

create or replace function app.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function app.slugify(input_text text)
returns text
language sql
immutable
as $$
  select coalesce(nullif(trim(both '-' from regexp_replace(lower(coalesce(input_text, '')), '[^a-z0-9]+', '-', 'g')), ''), 'studioflow');
$$;

create or replace function app.unique_agency_slug(input_text text)
returns citext
language plpgsql
security definer
set search_path = public
as $$
declare
  base_slug text := app.slugify(input_text);
  candidate text := base_slug;
  suffix integer := 0;
begin
  loop
    exit when not exists (
      select 1
      from public.agencies
      where slug = candidate::citext
    );

    suffix := suffix + 1;
    candidate := base_slug || '-' || suffix::text;
  end loop;

  return candidate::citext;
end;
$$;

create or replace function app.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, default_role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data ->> 'default_role')::public.app_role, 'client')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function app.handle_new_user();

create or replace function app.sync_project_agency()
returns trigger
language plpgsql
as $$
declare
  client_agency_id uuid;
begin
  select agency_id
  into client_agency_id
  from public.clients
  where id = new.client_id;

  if client_agency_id is null then
    raise exception 'Client not found for project';
  end if;

  new.agency_id := client_agency_id;
  return new;
end;
$$;

create trigger projects_sync_agency_before_write
before insert or update on public.projects
for each row execute function app.sync_project_agency();

create or replace function app.viewer_is_agency_member(target_agency_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.agency_members member
    where member.user_id = auth.uid()
      and member.agency_id = target_agency_id
      and member.is_active
  );
$$;

create or replace function app.viewer_is_agency_owner(target_agency_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.agency_members member
    where member.user_id = auth.uid()
      and member.agency_id = target_agency_id
      and member.is_active
      and member.role = 'agency_owner'
  );
$$;

create or replace function app.viewer_is_client_user(target_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.client_users client_user
    where client_user.user_id = auth.uid()
      and client_user.client_id = target_client_id
  );
$$;

create or replace function app.viewer_can_access_client(target_client_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.clients client
    where client.id = target_client_id
      and (
        app.viewer_is_agency_member(client.agency_id)
        or app.viewer_is_client_user(client.id)
      )
  );
$$;

create or replace function app.viewer_is_project_client(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.projects project
    join public.client_users client_user on client_user.client_id = project.client_id
    where project.id = target_project_id
      and client_user.user_id = auth.uid()
  );
$$;

create or replace function app.viewer_can_access_project(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.projects project
    where project.id = target_project_id
      and (
        app.viewer_is_agency_member(project.agency_id)
        or app.viewer_is_project_client(project.id)
      )
  );
$$;

create or replace function app.project_client_id(target_project_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select client_id
  from public.projects
  where id = target_project_id;
$$;

create or replace function app.project_agency_id(target_project_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select agency_id
  from public.projects
  where id = target_project_id;
$$;

create or replace function public.bootstrap_agency_owner(input_agency_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  viewer_id uuid := auth.uid();
  created_agency_id uuid;
begin
  if viewer_id is null then
    raise exception 'Authentication required';
  end if;

  if nullif(trim(input_agency_name), '') is null then
    raise exception 'Agency name is required';
  end if;

  if exists (
    select 1
    from public.agency_members member
    where member.user_id = viewer_id
      and member.is_active
  ) then
    raise exception 'User already belongs to an agency';
  end if;

  insert into public.agencies (name, slug, owner_user_id)
  values (
    trim(input_agency_name),
    app.unique_agency_slug(input_agency_name),
    viewer_id
  )
  returning id into created_agency_id;

  insert into public.agency_members (agency_id, user_id, role, title)
  values (created_agency_id, viewer_id, 'agency_owner', 'Owner');

  update public.profiles
  set default_role = 'agency_owner',
      updated_at = timezone('utc', now())
  where id = viewer_id;

  return created_agency_id;
end;
$$;

grant usage on schema app to authenticated;
grant execute on function app.unique_agency_slug(text) to authenticated;
grant execute on function app.viewer_is_agency_member(uuid) to authenticated;
grant execute on function app.viewer_is_agency_owner(uuid) to authenticated;
grant execute on function app.viewer_is_client_user(uuid) to authenticated;
grant execute on function app.viewer_can_access_client(uuid) to authenticated;
grant execute on function app.viewer_is_project_client(uuid) to authenticated;
grant execute on function app.viewer_can_access_project(uuid) to authenticated;
grant execute on function app.project_client_id(uuid) to authenticated;
grant execute on function app.project_agency_id(uuid) to authenticated;
grant execute on function public.bootstrap_agency_owner(text) to authenticated;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function app.set_updated_at();

create trigger agencies_set_updated_at
before update on public.agencies
for each row execute function app.set_updated_at();

create trigger clients_set_updated_at
before update on public.clients
for each row execute function app.set_updated_at();

create trigger client_private_details_set_updated_at
before update on public.client_private_details
for each row execute function app.set_updated_at();

create trigger projects_set_updated_at
before update on public.projects
for each row execute function app.set_updated_at();

create trigger project_private_details_set_updated_at
before update on public.project_private_details
for each row execute function app.set_updated_at();

create trigger onboarding_submissions_set_updated_at
before update on public.onboarding_submissions
for each row execute function app.set_updated_at();

create trigger proposals_set_updated_at
before update on public.proposals
for each row execute function app.set_updated_at();

create trigger approval_requests_set_updated_at
before update on public.approval_requests
for each row execute function app.set_updated_at();

create trigger revision_requests_set_updated_at
before update on public.revision_requests
for each row execute function app.set_updated_at();

create trigger invoices_set_updated_at
before update on public.invoices
for each row execute function app.set_updated_at();

create trigger proposal_items_refresh_total_after_write
after insert or update or delete on public.proposal_items
for each row execute function app.refresh_proposal_total();

commit;
