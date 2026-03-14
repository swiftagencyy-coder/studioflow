import Link from "next/link";
import {
  CircleCheckBig,
  FilePlus2,
  FolderKanban,
  ReceiptText,
  Upload,
  Users
} from "lucide-react";

import { CreateClientDialog } from "@/components/forms/create-client-dialog";
import { CreateProjectDialog } from "@/components/forms/create-project-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAgencyWorkspace } from "@/lib/auth/context";
import {
  getAgencyClients,
  getAgencyDashboardData
} from "@/lib/data/studioflow";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const viewer = await requireAgencyWorkspace();
  const [dashboard, clients] = await Promise.all([
    getAgencyDashboardData(viewer.agencyMembership),
    getAgencyClients(viewer.agencyMembership.agency_id)
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            <CreateClientDialog />
            <CreateProjectDialog clients={clients.map((client) => ({ id: client.id, name: client.name }))} />
          </>
        }
        description="Track client delivery, approvals, revisions, and billing from one workspace."
        eyebrow="Agency dashboard"
        title={`Welcome back, ${viewer.profile.full_name.split(" ")[0]}`}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          description="Clients currently marked active"
          icon={Users}
          title="Active clients"
          value={dashboard.activeClients}
        />
        <StatCard
          description="Projects still moving through production"
          icon={FolderKanban}
          title="Active projects"
          value={dashboard.activeProjects}
        />
        <StatCard
          description="Deliverables waiting for client feedback"
          icon={CircleCheckBig}
          title="Pending approvals"
          value={dashboard.pendingApprovals}
        />
        <StatCard
          description="Invoices still open or unpaid"
          icon={ReceiptText}
          title="Unpaid invoices"
          value={dashboard.unpaidInvoices}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Button asChild variant="secondary">
              <Link href="/clients">
                <Users className="h-4 w-4" />
                Create client
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/projects">
                <FolderKanban className="h-4 w-4" />
                Create project
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/projects">
                <FilePlus2 className="h-4 w-4" />
                Create proposal
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/projects">
                <Upload className="h-4 w-4" />
                Upload deliverable
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboard.recentActivity.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-border/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold">{entry.message}</div>
                  <StatusBadge value={entry.visibility} />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {entry.actor_name} · {formatDate(entry.created_at)}
                </div>
              </div>
            ))}
            {!dashboard.recentActivity.length ? (
              <p className="text-sm text-muted-foreground">Activity appears here as work moves forward.</p>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
