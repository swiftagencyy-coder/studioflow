import Link from "next/link";
import { CircleCheckBig, FileStack, FolderKanban, ReceiptText, RotateCcw } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireClientViewer } from "@/lib/auth/context";
import { getPortalOverview } from "@/lib/data/studioflow";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function PortalHomePage() {
  const viewer = await requireClientViewer();
  const overview = await getPortalOverview(viewer.clientMembership);

  return (
    <div className="space-y-6">
      <PageHeader
        description="Everything your team needs for this engagement, without the back-and-forth."
        eyebrow="Client portal"
        title={overview.client?.name ?? "Your workspace"}
      />
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
            {overview.projects.map((project) => (
              <Link key={project.id} className="block rounded-2xl border border-border/70 p-4 transition hover:bg-secondary/50" href={`/portal/projects/${project.id}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{project.name}</div>
                  <StatusBadge value={project.status} />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {project.service_type} · Due {formatDate(project.due_date)}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.activity.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-border/70 p-4">
                <div className="font-semibold">{entry.message}</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {entry.actor_name} · {formatDate(entry.created_at)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
      <section className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Proposals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.proposals.map((proposal) => (
              <Link key={proposal.id} className="block rounded-2xl border border-border/70 p-4 transition hover:bg-secondary/50" href={`/portal/proposals/${proposal.id}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{proposal.title}</div>
                  <StatusBadge value={proposal.status} />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{formatCurrency(proposal.pricing_total)}</div>
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revisions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.revisions.map((revision) => (
              <div key={revision.id} className="rounded-2xl border border-border/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{revision.title}</div>
                  <StatusBadge value={revision.status} />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {revision.priority} · {formatDate(revision.created_at)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.invoices.map((invoice) => (
              <div key={invoice.id} className="rounded-2xl border border-border/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{invoice.invoice_number}</div>
                  <StatusBadge value={invoice.status} />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{formatCurrency(invoice.amount)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
