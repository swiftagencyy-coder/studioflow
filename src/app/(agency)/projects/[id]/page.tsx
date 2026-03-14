import Link from "next/link";
import type { Route } from "next";
import {
  CircleCheckBig,
  ClipboardList,
  FileStack,
  FileText,
  ReceiptText,
  RotateCcw
} from "lucide-react";

import { RequestOnboardingButton } from "@/components/forms/request-onboarding-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjectDetail } from "@/lib/data/studioflow";
import { formatDate } from "@/lib/utils";

export default async function ProjectOverviewPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getProjectDetail(id);

  if (!detail.project) {
    return <div className="text-sm text-muted-foreground">Project not found.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={<RequestOnboardingButton projectId={detail.project.id} />}
        description={`${detail.project.client?.name ?? "Client"} · ${detail.project.service_type}`}
        eyebrow="Project"
        title={detail.project.name}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          description="Current project stage"
          icon={ClipboardList}
          title="Status"
          value={detail.project.status.replace(/_/g, " ")}
        />
        <StatCard
          description="Files uploaded to this project"
          icon={FileStack}
          title="Files"
          value={detail.files.length}
        />
        <StatCard
          description="Open approval threads"
          icon={CircleCheckBig}
          title="Approvals"
          value={detail.approvals.filter((item) => item.status === "pending").length}
        />
        <StatCard
          description="Invoice records"
          icon={ReceiptText}
          title="Invoices"
          value={detail.invoices.length}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Project summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>{detail.project.description || "No project description yet."}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-secondary/50 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Due date</div>
                <div className="mt-2 font-semibold text-foreground">{formatDate(detail.project.due_date)}</div>
              </div>
              <div className="rounded-2xl bg-secondary/50 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Client-facing summary</div>
                <div className="mt-2 font-semibold text-foreground">{detail.project.portal_summary || "Not added"}</div>
              </div>
            </div>
            <div className="rounded-2xl border border-border/70 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Internal notes</div>
              <div className="mt-2 text-foreground">
                {detail.privateDetails?.internal_notes || "No internal notes yet."}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workflow routes</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              { href: `/projects/${id}/onboarding`, icon: ClipboardList, label: "Onboarding" },
              { href: `/projects/${id}/files`, icon: FileStack, label: "Files" },
              { href: `/projects/${id}/proposal`, icon: FileText, label: "Proposal" },
              { href: `/projects/${id}/approvals`, icon: CircleCheckBig, label: "Approvals" },
              { href: `/projects/${id}/revisions`, icon: RotateCcw, label: "Revisions" },
              { href: `/projects/${id}/invoices`, icon: ReceiptText, label: "Invoices" }
            ].map((item) => (
              <Button key={item.href} asChild className="justify-start" variant="secondary">
                <Link href={item.href as Route}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {detail.activity.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-border/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{entry.message}</div>
                  <StatusBadge value={entry.visibility} />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {entry.actor_name} · {formatDate(entry.created_at)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Latest files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {detail.files.slice(0, 5).map((file) => (
              <div key={file.id} className="rounded-2xl border border-border/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{file.file_name}</div>
                  <StatusBadge value={file.visibility} />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {file.category.replace(/_/g, " ")} · {formatDate(file.created_at)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
