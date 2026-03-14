import Link from "next/link";

import { AcceptInvitationButton } from "@/components/forms/accept-invitation-button";
import { LogoMark } from "@/components/shared/logo-mark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getViewerContext } from "@/lib/auth/context";
import { getInvitationPreviewByToken } from "@/lib/data/studioflow";
import { formatDate } from "@/lib/utils";

export default async function InvitationPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [invitation, viewer] = await Promise.all([
    getInvitationPreviewByToken(token),
    getViewerContext()
  ]);

  if (!invitation) {
    return (
      <div className="min-h-screen px-4 py-10 lg:px-6">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Invitation not found</CardTitle>
              <CardDescription>The invitation link is invalid or has already been removed.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const accent = invitation.agency?.brand_primary_color ?? "#0f766e";
  const inviteRoleLabel = invitation.invited_role === "client" ? "Client portal access" : "Team workspace access";
  const isMatchingViewer =
    viewer && viewer.profile.email.toLowerCase() === invitation.email.toLowerCase();

  return (
    <div className="min-h-screen px-4 py-10 lg:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex justify-center">
          <LogoMark />
        </div>
        <Card
          className="overflow-hidden"
          style={{
            borderColor: `${accent}33`,
            background: `linear-gradient(135deg, ${accent}18, transparent 60%)`
          }}
        >
          <CardHeader>
            <CardTitle>{invitation.agency?.portal_headline ?? "You were invited to StudioFlow"}</CardTitle>
            <CardDescription>
              {invitation.agency?.portal_subheadline ??
                "Join the workspace to collaborate, review client work, and keep delivery organized."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="font-medium text-foreground">{invitation.agency?.name}</div>
            <div>
              {inviteRoleLabel}
              {invitation.client?.name ? ` · ${invitation.client.name}` : ""}
            </div>
            <div>Invited email · {invitation.email}</div>
            <div>Expires · {formatDate(invitation.expires_at)}</div>
            {invitation.agency?.website ? (
              <a className="font-semibold text-primary" href={invitation.agency.website} rel="noreferrer" target="_blank">
                Visit agency website
              </a>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Accept invitation</CardTitle>
            <CardDescription>
              {invitation.status === "pending"
                ? "Use the matching email address to accept the invitation."
                : `This invitation is currently marked ${invitation.status}.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-muted-foreground">
              {viewer
                ? `Signed in as ${viewer.profile.email}.`
                : "Sign in or create an account with the invited email address first."}
            </div>
            {invitation.status === "pending" ? (
              viewer ? (
                isMatchingViewer ? (
                  <AcceptInvitationButton token={token} />
                ) : (
                  <div className="text-sm text-destructive">
                    This invite was sent to {invitation.email}. Switch accounts to accept it.
                  </div>
                )
              ) : (
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="outline">
                    <Link href={`/login?invite=${token}`}>Sign in</Link>
                  </Button>
                  <Button asChild>
                    <Link href={`/register?invite=${token}`}>Create account</Link>
                  </Button>
                </div>
              )
            ) : viewer ? (
              <Button asChild>
                <Link href={invitation.invited_role === "client" ? "/portal" : "/dashboard"}>
                  Open StudioFlow
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/login">Open StudioFlow</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
