begin;

create type public.invitation_status as enum ('pending', 'accepted', 'revoked', 'expired');

alter table public.agencies
  add column if not exists website text,
  add column if not exists brand_primary_color text not null default '#0f766e',
  add column if not exists portal_headline text,
  add column if not exists portal_subheadline text;

create table public.workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies (id) on delete cascade,
  client_id uuid references public.clients (id) on delete cascade,
  email citext not null,
  full_name text,
  title text,
  invited_role public.app_role not null,
  status public.invitation_status not null default 'pending',
  token text not null unique,
  invited_by uuid references public.profiles (id) on delete set null,
  expires_at timestamptz not null default timezone('utc', now()) + interval '14 days',
  accepted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  constraint workspace_invitations_role_check check (invited_role in ('team_member', 'client')),
  constraint workspace_invitations_client_scope_check check (
    (invited_role = 'client' and client_id is not null)
    or (invited_role = 'team_member' and client_id is null)
  )
);

create index workspace_invitations_agency_id_idx
on public.workspace_invitations (agency_id, created_at desc);

create index workspace_invitations_email_idx
on public.workspace_invitations (email, status);

create unique index workspace_invitations_pending_unique_idx
on public.workspace_invitations (
  agency_id,
  email,
  invited_role,
  coalesce(client_id, '00000000-0000-0000-0000-000000000000'::uuid)
)
where status = 'pending';

create or replace function app.sync_workspace_invitation_scope()
returns trigger
language plpgsql
as $$
declare
  client_agency_id uuid;
begin
  if new.invited_role = 'client' then
    select agency_id
    into client_agency_id
    from public.clients
    where id = new.client_id;

    if client_agency_id is null then
      raise exception 'Client not found for invitation';
    end if;

    new.agency_id := client_agency_id;
  else
    new.client_id := null;
  end if;

  return new;
end;
$$;

create trigger workspace_invitations_sync_scope_before_write
before insert or update on public.workspace_invitations
for each row execute function app.sync_workspace_invitation_scope();

alter table public.workspace_invitations enable row level security;
alter table public.workspace_invitations force row level security;

create policy "workspace_invitations_select_agency"
on public.workspace_invitations
for select
using (app.viewer_is_agency_member(agency_id));

create policy "workspace_invitations_insert_agency"
on public.workspace_invitations
for insert
with check (
  app.viewer_is_agency_member(agency_id)
  and (
    invited_by is null
    or invited_by = auth.uid()
  )
);

create policy "workspace_invitations_update_agency"
on public.workspace_invitations
for update
using (app.viewer_is_agency_member(agency_id))
with check (app.viewer_is_agency_member(agency_id));

create policy "workspace_invitations_delete_owner"
on public.workspace_invitations
for delete
using (app.viewer_is_agency_owner(agency_id));

create or replace function public.accept_workspace_invitation(invitation_token text)
returns public.workspace_invitations
language plpgsql
security definer
set search_path = public
as $$
declare
  viewer_id uuid := auth.uid();
  viewer_profile public.profiles;
  invitation public.workspace_invitations;
  now_utc timestamptz := timezone('utc', now());
begin
  if viewer_id is null then
    raise exception 'Authentication required';
  end if;

  select *
  into viewer_profile
  from public.profiles
  where id = viewer_id;

  if viewer_profile.id is null then
    raise exception 'Profile not found';
  end if;

  update public.workspace_invitations
  set status = 'expired'
  where status = 'pending'
    and expires_at < now_utc;

  select *
  into invitation
  from public.workspace_invitations
  where token = invitation_token
    and status = 'pending'
    and expires_at >= now_utc;

  if invitation.id is null then
    raise exception 'Invitation is no longer available';
  end if;

  if lower(viewer_profile.email) <> lower(invitation.email) then
    raise exception 'Invitation email does not match your account';
  end if;

  if invitation.invited_role = 'team_member' then
    if exists (
      select 1
      from public.client_users client_user
      where client_user.user_id = viewer_id
    ) then
      raise exception 'Client accounts cannot accept team invitations';
    end if;

    if exists (
      select 1
      from public.agency_members member
      where member.user_id = viewer_id
        and member.is_active
        and member.agency_id <> invitation.agency_id
    ) then
      raise exception 'This account already belongs to another agency';
    end if;

    insert into public.agency_members (agency_id, user_id, role, title, is_active)
    values (invitation.agency_id, viewer_id, 'team_member', invitation.title, true)
    on conflict (agency_id, user_id) do update
      set role = 'team_member',
          title = coalesce(excluded.title, public.agency_members.title),
          is_active = true;

    update public.profiles
    set default_role = 'team_member',
        updated_at = now_utc
    where id = viewer_id;
  else
    if invitation.client_id is null then
      raise exception 'Client invitation is misconfigured';
    end if;

    if exists (
      select 1
      from public.agency_members member
      where member.user_id = viewer_id
        and member.is_active
    ) then
      raise exception 'Agency accounts cannot accept client invitations';
    end if;

    if exists (
      select 1
      from public.client_users client_user
      where client_user.user_id = viewer_id
        and client_user.client_id <> invitation.client_id
    ) then
      raise exception 'This account already belongs to another client workspace';
    end if;

    insert into public.client_users (client_id, user_id, title, is_primary)
    values (invitation.client_id, viewer_id, invitation.title, false)
    on conflict (client_id, user_id) do update
      set title = coalesce(excluded.title, public.client_users.title);

    update public.profiles
    set default_role = 'client',
        updated_at = now_utc
    where id = viewer_id;
  end if;

  update public.workspace_invitations
  set status = 'accepted',
      accepted_at = now_utc
  where id = invitation.id
  returning * into invitation;

  return invitation;
end;
$$;

grant execute on function public.accept_workspace_invitation(text) to authenticated;

commit;
