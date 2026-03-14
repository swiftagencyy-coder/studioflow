import Link from "next/link";

import { OnboardingForm } from "@/components/forms/onboarding-form";
import { RevisionRequestForm } from "@/components/forms/revision-request-form";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPortalProjectDetail } from "@/lib/data/studioflow";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function PortalProjectPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getPortalProjectDetail(id);

  if (!detail.project) {
    return <div className="text-sm text-muted-foreground">Project not found.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description={detail.project.portal_summary || detail.project.description || "Project overview"}
        eyebrow="Project portal"
        title={detail.project.name}
      />
      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Project details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between gap-3">
              <span>Status</span>
              <StatusBadge value={detail.project.status} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Due date</span>
              <span>{formatDate(detail.project.due_date)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Service</span>
              <span>{detail.project.service_type}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Onboarding</CardTitle>
          </CardHeader>
          <CardContent>
            <OnboardingForm existing={detail.onboarding} projectId={id} />
          </CardContent>
        </Card>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Files shared with you</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {detail.files.map((file) => (
              <div key={file.id} className="rounded-2xl border border-border/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold">{file.file_name}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{file.category.replace(/_/g, " ")}</div>
                  </div>
                  {file.signedUrl ? (
                    <a
                      className="text-sm font-semibold text-primary"
                      href={file.signedUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Download
                    </a>
                  ) : null}
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
            {detail.invoices.map((invoice) => (
              <div key={invoice.id} className="rounded-2xl border border-border/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{invoice.invoice_number}</div>
                  <StatusBadge value={invoice.status} />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {formatCurrency(invoice.amount)} · Due {formatDate(invoice.due_date)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Approvals and proposals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {detail.proposals.map((proposal) => (
              <Link key={proposal.id} className="block rounded-2xl border border-border/70 p-4 transition hover:bg-secondary/50" href={`/portal/proposals/${proposal.id}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{proposal.title}</div>
                  <StatusBadge value={proposal.status} />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{formatCurrency(proposal.pricing_total)}</div>
              </Link>
            ))}
            {detail.approvals.map((approval) => (
              <Link key={approval.id} className="block rounded-2xl border border-border/70 p-4 transition hover:bg-secondary/50" href={`/portal/approvals/${approval.id}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{approval.title}</div>
                  <StatusBadge value={approval.status} />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{approval.message || "Review request"}</div>
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Need revisions?</CardTitle>
          </CardHeader>
          <CardContent>
            <RevisionRequestForm projectId={id} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
