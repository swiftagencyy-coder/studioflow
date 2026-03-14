import Link from "next/link";
import {
  BarChart3,
  CalendarClock,
  CircleCheckBig,
  FilePlus2,
  FolderKanban,
  ReceiptText,
  TrendingUp,
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
import { formatCurrency, formatDate } from "@/lib/utils";

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
      <section className="grid gap-4 xl:grid-cols-3">
        <StatCard
          description="Invoices currently sent or overdue"
          icon={TrendingUp}
          title="Open revenue"
          value={formatCurrency(dashboard.openRevenue)}
        />
        <StatCard
          description="Invoices already marked paid"
          icon={ReceiptText}
          title="Collected revenue"
          value={formatCurrency(dashboard.collectedRevenue)}
        />
        <StatCard
          description="Accepted proposals out of non-draft proposals"
          icon={BarChart3}
          title="Proposal win rate"
          value={`${dashboard.proposalAcceptanceRate}%`}
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
            <CreateProjectDialog
              clients={clients.map((client) => ({ id: client.id, name: client.name }))}
              trigger={
                <Button variant="secondary">
                  <FolderKanban className="h-4 w-4" />
                  Create project
                </Button>
              }
            />
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
      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboard.projectStatusCounts.length ? (
              dashboard.projectStatusCounts.map((item) => {
                const ratio = dashboard.activeProjects
                  ? Math.max(12, Math.round((item.count / dashboard.activeProjects) * 100))
                  : 12;

                return (
                  <div key={item.status} className="space-y-2">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <div className="font-medium capitalize text-foreground">
                        {item.status.replace(/_/g, " ")}
                      </div>
                      <div className="text-muted-foreground">{item.count}</div>
                    </div>
                    <div className="h-2 rounded-full bg-secondary">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${ratio}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">Project distribution appears here after the first active job is created.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              Upcoming deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.projectsDueSoon.length ? (
              dashboard.projectsDueSoon.map((project) => (
                <div key={project.id} className="rounded-2xl border border-border/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">{project.name}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{project.client?.name ?? "Client project"}</div>
                    </div>
                    <div className="text-sm font-medium text-foreground">{formatDate(project.due_date)}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming deadlines in the next seven days.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
