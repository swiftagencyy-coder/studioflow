import Link from "next/link";
import { FileStack, FolderKanban, ReceiptText } from "lucide-react";

import { ArchiveClientButton } from "@/components/forms/archive-client-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientDetail } from "@/lib/data/studioflow";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function ClientDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getClientDetail(id);

  if (!detail.client) {
    return <div className="text-sm text-muted-foreground">Client not found.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={<ArchiveClientButton clientId={detail.client.id} />}
        description={`${detail.client.contact_name} · ${detail.client.email}`}
        eyebrow="Client profile"
        title={detail.client.name}
      />

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <StatusBadge value={detail.client.status} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Phone</span>
              <span>{detail.client.phone ?? "Not added"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Tags</span>
              <span>{detail.client.tags.join(", ") || "None"}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Internal notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-muted-foreground">
            {detail.privateDetails?.notes || "No internal notes yet."}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {detail.projects.map((project) => (
              <Link key={project.id} className="block rounded-2xl border border-border/70 p-4 transition hover:bg-secondary/50" href={`/projects/${project.id}`}>
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
            {detail.activity.map((entry) => (
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
            <CardTitle className="flex items-center gap-2">
              <FileStack className="h-4 w-4" />
              Files
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {detail.files.slice(0, 5).map((file) => (
              <div key={file.id} className="rounded-2xl border border-border/70 p-4">
                <div className="font-semibold">{file.file_name}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {file.category.replace(/_/g, " ")} · {formatDate(file.created_at)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4" />
              Proposals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {detail.proposals.slice(0, 5).map((proposal) => (
              <div key={proposal.id} className="rounded-2xl border border-border/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{proposal.title}</div>
                  <StatusBadge value={proposal.status} />
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{formatCurrency(proposal.pricing_total)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ReceiptText className="h-4 w-4" />
              Invoices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {detail.invoices.slice(0, 5).map((invoice) => (
              <div key={invoice.id} className="rounded-2xl border border-border/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{invoice.invoice_number}</div>
                  <StatusBadge value={invoice.status} />
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{formatCurrency(invoice.amount)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
