begin;

alter table public.profiles enable row level security;
alter table public.agencies enable row level security;
alter table public.agency_members enable row level security;
alter table public.clients enable row level security;
alter table public.client_private_details enable row level security;
alter table public.client_users enable row level security;
alter table public.projects enable row level security;
alter table public.project_private_details enable row level security;
alter table public.onboarding_submissions enable row level security;
alter table public.uploaded_files enable row level security;
alter table public.proposals enable row level security;
alter table public.proposal_items enable row level security;
alter table public.approval_requests enable row level security;
alter table public.revision_requests enable row level security;
alter table public.invoices enable row level security;
alter table public.activity_logs enable row level security;

alter table public.profiles force row level security;
alter table public.agencies force row level security;
alter table public.agency_members force row level security;
alter table public.clients force row level security;
alter table public.client_private_details force row level security;
alter table public.client_users force row level security;
alter table public.projects force row level security;
alter table public.project_private_details force row level security;
alter table public.onboarding_submissions force row level security;
alter table public.uploaded_files force row level security;
alter table public.proposals force row level security;
alter table public.proposal_items force row level security;
alter table public.approval_requests force row level security;
alter table public.revision_requests force row level security;
alter table public.invoices force row level security;
alter table public.activity_logs force row level security;

create policy "profiles_select_self"
on public.profiles
for select
using (auth.uid() = id);

create policy "profiles_update_self"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "agencies_select_member"
on public.agencies
for select
using (app.viewer_is_agency_member(id));

create policy "agencies_update_owner"
on public.agencies
for update
using (app.viewer_is_agency_owner(id))
with check (app.viewer_is_agency_owner(id));

create policy "agency_members_select_same_agency"
on public.agency_members
for select
using (app.viewer_is_agency_member(agency_id));

create policy "agency_members_insert_owner"
on public.agency_members
for insert
with check (app.viewer_is_agency_owner(agency_id));

create policy "agency_members_update_owner"
on public.agency_members
for update
using (app.viewer_is_agency_owner(agency_id))
with check (app.viewer_is_agency_owner(agency_id));

create policy "agency_members_delete_owner"
on public.agency_members
for delete
using (app.viewer_is_agency_owner(agency_id));

create policy "clients_select_agency_or_client"
on public.clients
for select
using (
  app.viewer_is_agency_member(agency_id)
  or app.viewer_is_client_user(id)
);

create policy "clients_insert_agency_member"
on public.clients
for insert
with check (
  app.viewer_is_agency_member(agency_id)
  and (
    created_by is null
    or created_by = auth.uid()
  )
);

create policy "clients_update_agency_member"
on public.clients
for update
using (app.viewer_is_agency_member(agency_id))
with check (app.viewer_is_agency_member(agency_id));

create policy "clients_delete_agency_owner"
on public.clients
for delete
using (app.viewer_is_agency_owner(agency_id));

create policy "client_private_details_select_agency_only"
on public.client_private_details
for select
using (app.viewer_is_agency_member((select agency_id from public.clients where id = client_id)));

create policy "client_private_details_insert_agency_only"
on public.client_private_details
for insert
with check (app.viewer_is_agency_member((select agency_id from public.clients where id = client_id)));

create policy "client_private_details_update_agency_only"
on public.client_private_details
for update
using (app.viewer_is_agency_member((select agency_id from public.clients where id = client_id)))
with check (app.viewer_is_agency_member((select agency_id from public.clients where id = client_id)));

create policy "client_users_select_agency_or_self"
on public.client_users
for select
using (
  auth.uid() = user_id
  or app.viewer_is_agency_member((select agency_id from public.clients where id = client_id))
);

create policy "client_users_insert_agency"
on public.client_users
for insert
with check (app.viewer_is_agency_member((select agency_id from public.clients where id = client_id)));

create policy "client_users_update_agency"
on public.client_users
for update
using (app.viewer_is_agency_member((select agency_id from public.clients where id = client_id)))
with check (app.viewer_is_agency_member((select agency_id from public.clients where id = client_id)));

create policy "client_users_delete_agency"
on public.client_users
for delete
using (app.viewer_is_agency_member((select agency_id from public.clients where id = client_id)));

create policy "projects_select_agency_or_client"
on public.projects
for select
using (app.viewer_can_access_project(id));

create policy "projects_insert_agency"
on public.projects
for insert
with check (
  app.viewer_is_agency_member(agency_id)
  and (
    created_by is null
    or created_by = auth.uid()
  )
);

create policy "projects_update_agency"
on public.projects
for update
using (app.viewer_is_agency_member(agency_id))
with check (app.viewer_is_agency_member(agency_id));

create policy "projects_delete_owner"
on public.projects
for delete
using (app.viewer_is_agency_owner(agency_id));

create policy "project_private_details_select_agency_only"
on public.project_private_details
for select
using (app.viewer_is_agency_member(app.project_agency_id(project_id)));

create policy "project_private_details_insert_agency_only"
on public.project_private_details
for insert
with check (app.viewer_is_agency_member(app.project_agency_id(project_id)));

create policy "project_private_details_update_agency_only"
on public.project_private_details
for update
using (app.viewer_is_agency_member(app.project_agency_id(project_id)))
with check (app.viewer_is_agency_member(app.project_agency_id(project_id)));

create policy "onboarding_select_project_access"
on public.onboarding_submissions
for select
using (app.viewer_can_access_project(project_id));

create policy "onboarding_insert_project_access"
on public.onboarding_submissions
for insert
with check (
  app.viewer_can_access_project(project_id)
  and (
    submitted_by is null
    or submitted_by = auth.uid()
  )
);

create policy "onboarding_update_project_access"
on public.onboarding_submissions
for update
using (app.viewer_can_access_project(project_id))
with check (
  app.viewer_can_access_project(project_id)
  and (
    submitted_by is null
    or submitted_by = auth.uid()
    or app.viewer_is_agency_member(app.project_agency_id(project_id))
  )
);

create policy "uploaded_files_select_visible_access"
on public.uploaded_files
for select
using (
  app.viewer_is_agency_member(app.project_agency_id(project_id))
  or (
    app.viewer_is_project_client(project_id)
    and visibility = 'client'
  )
);

create policy "uploaded_files_insert_agency"
on public.uploaded_files
for insert
with check (
  app.viewer_is_agency_member(app.project_agency_id(project_id))
  and uploaded_by = auth.uid()
);

create policy "uploaded_files_insert_client"
on public.uploaded_files
for insert
with check (
  app.viewer_is_project_client(project_id)
  and visibility = 'client'
  and bucket in ('project-assets', 'onboarding-files')
  and category in ('logo', 'brand_asset', 'document', 'reference', 'onboarding_asset')
  and uploaded_by = auth.uid()
);

create policy "uploaded_files_update_agency"
on public.uploaded_files
for update
using (app.viewer_is_agency_member(app.project_agency_id(project_id)))
with check (app.viewer_is_agency_member(app.project_agency_id(project_id)));

create policy "uploaded_files_delete_agency"
on public.uploaded_files
for delete
using (app.viewer_is_agency_member(app.project_agency_id(project_id)));

create policy "proposals_select_agency_or_client_sent"
on public.proposals
for select
using (
  app.viewer_is_agency_member(app.project_agency_id(project_id))
  or (
    app.viewer_is_project_client(project_id)
    and status <> 'draft'
  )
);

create policy "proposals_insert_agency"
on public.proposals
for insert
with check (
  app.viewer_is_agency_member(app.project_agency_id(project_id))
  and (
    created_by is null
    or created_by = auth.uid()
  )
);

create policy "proposals_update_agency"
on public.proposals
for update
using (app.viewer_is_agency_member(app.project_agency_id(project_id)))
with check (app.viewer_is_agency_member(app.project_agency_id(project_id)));

create policy "proposals_delete_agency"
on public.proposals
for delete
using (app.viewer_is_agency_member(app.project_agency_id(project_id)));

create policy "proposal_items_select_via_proposal"
on public.proposal_items
for select
using (
  exists (
    select 1
    from public.proposals proposal
    where proposal.id = proposal_id
      and (
        app.viewer_is_agency_member(app.project_agency_id(proposal.project_id))
        or (
          app.viewer_is_project_client(proposal.project_id)
          and proposal.status <> 'draft'
        )
      )
  )
);

create policy "proposal_items_insert_agency"
on public.proposal_items
for insert
with check (
  exists (
    select 1
    from public.proposals proposal
    where proposal.id = proposal_id
      and app.viewer_is_agency_member(app.project_agency_id(proposal.project_id))
  )
);

create policy "proposal_items_update_agency"
on public.proposal_items
for update
using (
  exists (
    select 1
    from public.proposals proposal
    where proposal.id = proposal_id
      and app.viewer_is_agency_member(app.project_agency_id(proposal.project_id))
  )
)
with check (
  exists (
    select 1
    from public.proposals proposal
    where proposal.id = proposal_id
      and app.viewer_is_agency_member(app.project_agency_id(proposal.project_id))
  )
);

create policy "proposal_items_delete_agency"
on public.proposal_items
for delete
using (
  exists (
    select 1
    from public.proposals proposal
    where proposal.id = proposal_id
      and app.viewer_is_agency_member(app.project_agency_id(proposal.project_id))
  )
);

create policy "approval_requests_select_project_access"
on public.approval_requests
for select
using (app.viewer_can_access_project(project_id));

create policy "approval_requests_insert_agency"
on public.approval_requests
for insert
with check (
  app.viewer_is_agency_member(app.project_agency_id(project_id))
  and (
    requested_by is null
    or requested_by = auth.uid()
  )
);

create policy "approval_requests_update_agency"
on public.approval_requests
for update
using (app.viewer_is_agency_member(app.project_agency_id(project_id)))
with check (app.viewer_is_agency_member(app.project_agency_id(project_id)));

create policy "approval_requests_delete_agency"
on public.approval_requests
for delete
using (app.viewer_is_agency_member(app.project_agency_id(project_id)));

create policy "revision_requests_select_project_access"
on public.revision_requests
for select
using (app.viewer_can_access_project(project_id));

create policy "revision_requests_insert_agency_or_client"
on public.revision_requests
for insert
with check (
  app.viewer_can_access_project(project_id)
  and (
    submitted_by is null
    or submitted_by = auth.uid()
  )
);

create policy "revision_requests_update_agency"
on public.revision_requests
for update
using (app.viewer_is_agency_member(app.project_agency_id(project_id)))
with check (app.viewer_is_agency_member(app.project_agency_id(project_id)));

create policy "revision_requests_delete_agency"
on public.revision_requests
for delete
using (app.viewer_is_agency_member(app.project_agency_id(project_id)));

create policy "invoices_select_agency_or_client"
on public.invoices
for select
using (app.viewer_can_access_project(project_id));

create policy "invoices_insert_agency"
on public.invoices
for insert
with check (
  app.viewer_is_agency_member(app.project_agency_id(project_id))
  and (
    created_by is null
    or created_by = auth.uid()
  )
);

create policy "invoices_update_agency"
on public.invoices
for update
using (app.viewer_is_agency_member(app.project_agency_id(project_id)))
with check (app.viewer_is_agency_member(app.project_agency_id(project_id)));

create policy "invoices_delete_agency"
on public.invoices
for delete
using (app.viewer_is_agency_member(app.project_agency_id(project_id)));

create policy "activity_logs_select_visible_to_actor"
on public.activity_logs
for select
using (
  (
    project_id is not null
    and app.viewer_is_agency_member(app.project_agency_id(project_id))
  )
  or (
    client_id is not null
    and app.viewer_is_agency_member((select agency_id from public.clients where id = client_id))
  )
  or (
    visibility = 'client'
    and (
      (project_id is not null and app.viewer_is_project_client(project_id))
      or (client_id is not null and app.viewer_is_client_user(client_id))
    )
  )
);

create policy "activity_logs_insert_actor_scope"
on public.activity_logs
for insert
with check (
  (
    actor_user_id is null
    or actor_user_id = auth.uid()
  )
  and
  (
    project_id is not null
    and app.viewer_can_access_project(project_id)
  )
  or (
    client_id is not null
    and app.viewer_can_access_client(client_id)
  )
);

create or replace function public.respond_to_proposal(
  target_proposal_id uuid,
  decision public.proposal_status,
  response_body text default null
)
returns public.proposals
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_record public.proposals;
begin
  if decision not in ('accepted', 'rejected') then
    raise exception 'Invalid proposal decision';
  end if;

  update public.proposals proposal
  set status = decision,
      responded_at = timezone('utc', now()),
      response_message = nullif(trim(response_body), ''),
      updated_at = timezone('utc', now())
  where proposal.id = target_proposal_id
    and proposal.status = 'sent'
    and app.viewer_is_project_client(proposal.project_id)
  returning * into updated_record;

  if updated_record.id is null then
    raise exception 'Proposal is not available for response';
  end if;

  return updated_record;
end;
$$;

create or replace function public.respond_to_approval(
  target_approval_id uuid,
  decision public.approval_status,
  response_body text default null
)
returns public.approval_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_record public.approval_requests;
begin
  if decision not in ('approved', 'changes_requested') then
    raise exception 'Invalid approval response';
  end if;

  update public.approval_requests approval
  set status = decision,
      responded_at = timezone('utc', now()),
      response_message = nullif(trim(response_body), ''),
      updated_at = timezone('utc', now())
  where approval.id = target_approval_id
    and approval.status = 'pending'
    and app.viewer_is_project_client(approval.project_id)
  returning * into updated_record;

  if updated_record.id is null then
    raise exception 'Approval request is not available for response';
  end if;

  return updated_record;
end;
$$;

grant execute on function public.respond_to_proposal(uuid, public.proposal_status, text) to authenticated;
grant execute on function public.respond_to_approval(uuid, public.approval_status, text) to authenticated;

create or replace function app.storage_folder_uuid(folder text)
returns uuid
language plpgsql
immutable
as $$
begin
  return folder::uuid;
exception
  when others then
    return null;
end;
$$;

create or replace function app.storage_path_is_valid(object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = public, storage
as $$
declare
  folders text[];
  folder_agency_id uuid;
  folder_project_id uuid;
  folder_client_id uuid;
  folder_visibility text;
begin
  folders := storage.foldername(object_name);

  if array_length(folders, 1) < 4 then
    return false;
  end if;

  folder_agency_id := app.storage_folder_uuid(folders[1]);
  folder_project_id := app.storage_folder_uuid(folders[2]);
  folder_client_id := app.storage_folder_uuid(folders[3]);
  folder_visibility := folders[4];

  if folder_agency_id is null or folder_project_id is null or folder_client_id is null then
    return false;
  end if;

  if not exists (
    select 1
    from public.projects project
    where project.id = folder_project_id
      and project.agency_id = folder_agency_id
      and project.client_id = folder_client_id
  ) then
    return false;
  end if;

  return true;
end;
$$;

create or replace function app.viewer_can_read_storage(object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = public, storage
as $$
declare
  folders text[];
  folder_agency_id uuid;
  folder_client_id uuid;
begin
  if not app.storage_path_is_valid(object_name) then
    return false;
  end if;

  folders := storage.foldername(object_name);
  folder_agency_id := app.storage_folder_uuid(folders[1]);
  folder_client_id := app.storage_folder_uuid(folders[3]);

  if app.viewer_is_agency_member(folder_agency_id) then
    return true;
  end if;

  if folders[4] <> 'client' then
    return false;
  end if;

  return app.viewer_is_client_user(folder_client_id);
end;
$$;

create or replace function app.viewer_can_client_write_storage(object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = public, storage
as $$
declare
  folders text[];
  folder_client_id uuid;
begin
  if not app.storage_path_is_valid(object_name) then
    return false;
  end if;

  folders := storage.foldername(object_name);
  folder_client_id := app.storage_folder_uuid(folders[3]);

  if folders[4] <> 'client' then
    return false;
  end if;

  return app.viewer_is_client_user(folder_client_id);
end;
$$;

grant execute on function app.storage_folder_uuid(text) to authenticated;
grant execute on function app.storage_path_is_valid(text) to authenticated;
grant execute on function app.viewer_can_read_storage(text) to authenticated;
grant execute on function app.viewer_can_client_write_storage(text) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('project-assets', 'project-assets', false, 52428800),
  ('deliverables', 'deliverables', false, 52428800),
  ('onboarding-files', 'onboarding-files', false, 52428800)
on conflict (id) do nothing;

create policy "storage_select_scoped_private_objects"
on storage.objects
for select
using (
  bucket_id in ('project-assets', 'deliverables', 'onboarding-files')
  and app.viewer_can_read_storage(name)
);

create policy "storage_insert_agency_uploads"
on storage.objects
for insert
with check (
  bucket_id in ('project-assets', 'deliverables', 'onboarding-files')
  and app.storage_path_is_valid(name)
  and app.viewer_is_agency_member(app.storage_folder_uuid((storage.foldername(name))[1]))
);

create policy "storage_insert_client_uploads"
on storage.objects
for insert
with check (
  bucket_id in ('project-assets', 'onboarding-files')
  and app.viewer_can_client_write_storage(name)
);

create policy "storage_update_agency_only"
on storage.objects
for update
using (
  bucket_id in ('project-assets', 'deliverables', 'onboarding-files')
  and app.storage_path_is_valid(name)
  and app.viewer_is_agency_member(app.storage_folder_uuid((storage.foldername(name))[1]))
)
with check (
  bucket_id in ('project-assets', 'deliverables', 'onboarding-files')
  and app.storage_path_is_valid(name)
  and app.viewer_is_agency_member(app.storage_folder_uuid((storage.foldername(name))[1]))
);

create policy "storage_delete_agency_only"
on storage.objects
for delete
using (
  bucket_id in ('project-assets', 'deliverables', 'onboarding-files')
  and app.storage_path_is_valid(name)
  and app.viewer_is_agency_member(app.storage_folder_uuid((storage.foldername(name))[1]))
);

commit;
