import Link from "next/link";
import { CircleCheckBig, FileStack, FolderKanban, ReceiptText } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireViewer } from "@/lib/auth/context";
import {
  getAgencyDashboardData,
  getAgencyProjects,
  getPortalOverview
} from "@/lib/data/studioflow";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function PortalHomePage() {
  const viewer = await requireViewer();

  if (!viewer.clientMembership && viewer.agencyMembership) {
    const [dashboard, projects] = await Promise.all([
      getAgencyDashboardData(viewer.agencyMembership),
      getAgencyProjects(viewer.agencyMembership.agency_id)
    ]);
    const clientVisibleActivity = dashboard.recentActivity.filter((entry) => entry.visibility === "client");
    const previewAccent = dashboard.agency?.brand_primary_color ?? "#0f766e";

    return (
      <div className="space-y-6">
        <PageHeader
          description="Preview the client-facing workspace without switching accounts. Response controls stay disabled in preview mode."
          eyebrow="Portal preview"
          title="Client portal preview"
        />
        <Card
          className="overflow-hidden"
          style={{
            borderColor: `${previewAccent}33`,
            background: `linear-gradient(135deg, ${previewAccent}18, transparent 60%)`
          }}
        >
          <CardHeader>
            <CardTitle>{dashboard.agency?.portal_headline ?? "Everything your clients need, in one calm workspace."}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              {dashboard.agency?.portal_subheadline ??
                "Use this preview to validate the branded client experience before you invite contacts into the portal."}
            </p>
            {dashboard.agency?.website ? (
              <a className="font-semibold text-primary" href={dashboard.agency.website} rel="noreferrer" target="_blank">
                {dashboard.agency.website}
              </a>
            ) : null}
          </CardContent>
        </Card>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard description="Active clients in your workspace" icon={FolderKanban} title="Clients" value={dashboard.activeClients} />
          <StatCard description="Projects available to preview" icon={FileStack} title="Projects" value={projects.length} />
          <StatCard
            description="Approvals waiting on clients"
            icon={CircleCheckBig}
            title="Pending approvals"
            value={dashboard.pendingApprovals}
          />
          <StatCard
            description="Invoice records still unpaid"
            icon={ReceiptText}
            title="Open invoices"
            value={dashboard.unpaidInvoices}
          />
        </section>
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Preview projects</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {projects.length ? (
                projects.map((project) => (
                  <Link
                    key={project.id}
                    className="block rounded-2xl border border-border/70 p-4 transition hover:bg-secondary/50"
                    href={`/portal/projects/${project.id}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold">{project.name}</div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {project.client?.name ?? "Client"} · {project.service_type}
                        </div>
                      </div>
                      <StatusBadge value={project.status} />
                    </div>
                  </Link>
                ))
              ) : (
                <EmptyState
                  description="Create a client project to preview the exact portal experience your client will see."
                  icon={FolderKanban}
                  title="No projects to preview"
                />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent client-visible activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {clientVisibleActivity.length ? (
                clientVisibleActivity.map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-border/70 p-4">
                    <div className="font-semibold">{entry.message}</div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {entry.actor_name} · {formatDate(entry.created_at)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Client-facing activity appears here after proposals, approvals, onboarding, or invoices are shared.
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    );
  }

  if (!viewer.clientMembership) {
    return (
      <div className="space-y-6">
        <PageHeader
          description="This account is signed in, but it is not connected to a live client workspace yet."
          eyebrow="Portal access"
          title="Your portal access is still pending"
        />
        <section className="sf-emptyAccess">
          <h2 className="sf-emptyAccessTitle">No client workspace has been attached to this account yet.</h2>
          <p className="sf-emptyAccessText">
            If you were invited by a studio, use the invitation link again after signing in so the
            workspace can be attached to this account. If you are setting up your own team
            workspace, finish setup first and then return to the portal preview.
          </p>
          <div className="sf-emptyAccessActions">
            <Button asChild variant="outline">
              <Link href="/">Return home</Link>
            </Button>
            {viewer.role !== "client" ? (
              <Button asChild>
                <Link href="/setup">Finish workspace setup</Link>
              </Button>
            ) : null}
          </div>
        </section>
      </div>
    );
  }

  const overview = await getPortalOverview(viewer.clientMembership);
  const portalAccent = overview.agency?.brand_primary_color ?? "#0f766e";

  return (
    <div className="space-y-6">
      <PageHeader
        description={
          overview.agency?.portal_subheadline ??
          "Everything your team needs for this engagement, without the back-and-forth."
        }
        eyebrow="Client portal"
        title={overview.agency?.portal_headline ?? overview.client?.name ?? "Your workspace"}
      />
      <Card
        className="overflow-hidden"
        style={{
          borderColor: `${portalAccent}33`,
          background: `linear-gradient(135deg, ${portalAccent}18, transparent 60%)`
        }}
      >
        <CardContent className="flex flex-col gap-3 p-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-semibold text-foreground">{overview.client?.name ?? "Client workspace"}</div>
            <div className="mt-1">Managed by {overview.agency?.name ?? "your studio team"}.</div>
          </div>
          {overview.agency?.website ? (
            <a className="font-semibold text-primary" href={overview.agency.website} rel="noreferrer" target="_blank">
              Visit studio site
            </a>
          ) : null}
        </CardContent>
      </Card>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard description="Projects in your portal" icon={FolderKanban} title="Projects" value={overview.projects.length} />
        <StatCard description="Files shared with you" icon={FileStack} title="Files" value={overview.files.length} />
        <StatCard
          description="Approvals waiting on you"
          icon={CircleCheckBig}
          title="Pending approvals"
          value={overview.approvals.filter((item) => item.status === "pending").length}
        />
        <StatCard
          description="Outstanding invoice records"
          icon={ReceiptText}
          title="Invoices"
          value={overview.invoices.filter((item) => item.status !== "paid").length}
        />
      </section>
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Your projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.projects.length ? (
              overview.projects.map((project) => (
                <Link
                  key={project.id}
                  className="block rounded-2xl border border-border/70 p-4 transition hover:bg-secondary/50"
                  href={`/portal/projects/${project.id}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold">{project.name}</div>
                    <StatusBadge value={project.status} />
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {project.service_type} · Due {formatDate(project.due_date)}
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Projects will appear here as soon as your studio shares them.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.activity.length ? (
              overview.activity.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-border/70 p-4">
                  <div className="font-semibold">{entry.message}</div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {entry.actor_name} · {formatDate(entry.created_at)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Activity appears here when your team shares updates.</p>
            )}
          </CardContent>
        </Card>
      </section>
      <section className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Proposals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.proposals.length ? (
              overview.proposals.map((proposal) => (
                <Link
                  key={proposal.id}
                  className="block rounded-2xl border border-border/70 p-4 transition hover:bg-secondary/50"
                  href={`/portal/proposals/${proposal.id}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold">{proposal.title}</div>
                    <StatusBadge value={proposal.status} />
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">{formatCurrency(proposal.pricing_total)}</div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">New proposals will appear here for review.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revisions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.revisions.length ? (
              overview.revisions.map((revision) => (
                <div key={revision.id} className="rounded-2xl border border-border/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold">{revision.title}</div>
                    <StatusBadge value={revision.status} />
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {revision.priority} · {formatDate(revision.created_at)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Revision requests show up here after feedback is submitted.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.invoices.length ? (
              overview.invoices.map((invoice) => (
                <div key={invoice.id} className="rounded-2xl border border-border/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold">{invoice.invoice_number}</div>
                    <StatusBadge value={invoice.status} />
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">{formatCurrency(invoice.amount)}</div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Invoice status will be shared here when billing is issued.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
