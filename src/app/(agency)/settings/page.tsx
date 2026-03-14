import { Building2, Palette, UserPlus2 } from "lucide-react";

import { AgencySettingsForm } from "@/components/forms/agency-settings-form";
import { InviteMemberDialog } from "@/components/forms/invite-member-dialog";
import { RevokeInvitationButton } from "@/components/forms/revoke-invitation-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAgencyViewer } from "@/lib/auth/context";
import { getAgencySettings } from "@/lib/data/studioflow";
import { formatDate } from "@/lib/utils";

export default async function SettingsPage() {
  const viewer = await requireAgencyViewer();
  const settings = await getAgencySettings(viewer.agencyMembership.agency_id);

  if (!settings.agency) {
    return <div className="text-sm text-muted-foreground">Workspace not found.</div>;
  }

  const isOwner = viewer.agencyMembership.role === "agency_owner";

  return (
    <div className="space-y-6">
      <PageHeader
        description="Tune your branding, messaging, and collaboration settings so the product feels premium and easy to expand."
        eyebrow="Workspace settings"
        title="Settings"
      />
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Branding and portal copy
            </CardTitle>
            <CardDescription>
              Set the client-facing headline, support copy, and primary brand color used in the portal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isOwner ? (
              <div className="rounded-2xl border border-border/70 bg-secondary/30 p-4 text-sm text-muted-foreground">
                Only the agency owner can update workspace branding.
              </div>
            ) : null}
            <AgencySettingsForm
              defaultValues={{
                brandPrimaryColor: settings.agency.brand_primary_color,
                name: settings.agency.name,
                portalHeadline:
                  settings.agency.portal_headline ??
                  "Everything you need for this project, all in one calm workspace.",
                portalSubheadline:
                  settings.agency.portal_subheadline ??
                  "Review deliverables, submit onboarding details, and keep communication organized without losing context.",
                website: settings.agency.website ?? ""
              }}
              disabled={!isOwner}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Growth levers
            </CardTitle>
            <CardDescription>
              These are the operational upgrades that make StudioFlow easier to sell and retain.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-2xl border border-border/70 p-4">
              <div className="font-semibold text-foreground">Branded client experience</div>
              <p className="mt-2">
                A stronger portal headline and a consistent brand color make the experience feel closer to a premium service than a generic tracker.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 p-4">
              <div className="font-semibold text-foreground">Invite-based onboarding</div>
              <p className="mt-2">
                Teams and clients can join with secure links instead of manual account setup, which reduces friction during sales and delivery.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 p-4">
              <div className="font-semibold text-foreground">Production-ready ops</div>
              <p className="mt-2">
                Settings, invitations, and search-ready directories are in place so you can package this as a paid product instead of a one-off demo.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserPlus2 className="h-4 w-4" />
              Invitations
            </CardTitle>
            <CardDescription>
              Pending and accepted invitations for teammates and client contacts.
            </CardDescription>
          </div>
          <InviteMemberDialog
            canInviteTeamMembers={isOwner}
            clients={settings.clients.map((client) => ({ id: client.id, name: client.name }))}
          />
        </CardHeader>
        <CardContent className="space-y-3">
          {settings.invitations.length ? (
            settings.invitations.map((invitation) => (
              <div key={invitation.id} className="rounded-2xl border border-border/70 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-semibold">{invitation.email}</div>
                      <StatusBadge value={invitation.status} />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {invitation.invited_role === "client"
                        ? `Client portal${invitation.client?.name ? ` | ${invitation.client.name}` : ""}`
                        : "Team member"}
                      {` | Sent ${formatDate(invitation.created_at)} | Expires ${formatDate(invitation.expires_at)}`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {invitation.full_name || "No name provided"}
                      {invitation.title ? ` | ${invitation.title}` : ""}
                    </div>
                  </div>
                  {isOwner && invitation.status === "pending" ? (
                    <RevokeInvitationButton invitationId={invitation.id} />
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No invitations yet. Send one to onboard a teammate or a client contact.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
