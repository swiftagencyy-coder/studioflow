begin;

drop policy if exists "workspace_invitations_insert_agency" on public.workspace_invitations;
drop policy if exists "workspace_invitations_update_agency" on public.workspace_invitations;

create policy "workspace_invitations_insert_agency"
on public.workspace_invitations
for insert
with check (
  (
    invited_role = 'team_member'
    and app.viewer_is_agency_owner(agency_id)
  )
  or (
    invited_role = 'client'
    and app.viewer_is_agency_member(agency_id)
  )
)
and (
  invited_by is null
  or invited_by = auth.uid()
);

create policy "workspace_invitations_update_agency"
on public.workspace_invitations
for update
using (app.viewer_is_agency_owner(agency_id))
with check (app.viewer_is_agency_owner(agency_id));

commit;
