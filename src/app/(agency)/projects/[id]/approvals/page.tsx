import { ApprovalRequestForm } from "@/components/forms/approval-request-form";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjectDetail } from "@/lib/data/studioflow";
import { formatDate } from "@/lib/utils";

export default async function ProjectApprovalsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getProjectDetail(id);

  if (!detail.project) {
    return <div className="text-sm text-muted-foreground">Project not found.</div>;
  }

  const deliverableFiles = detail.files
    .filter((file) => file.category === "deliverable")
    .map((file) => ({ fileName: file.file_name, id: file.id }));

  return (
    <div className="space-y-6">
      <PageHeader
        description="Send deliverables for review and keep approval feedback separate from general files."
        eyebrow="Approval workflow"
        title={`${detail.project.name} approvals`}
      />
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Request approval</CardTitle>
          </CardHeader>
          <CardContent>
            <ApprovalRequestForm deliverableFiles={deliverableFiles} projectId={id} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Approval requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {detail.approvals.map((approval) => (
              <div key={approval.id} className="rounded-2xl border border-border/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{approval.title}</div>
                  <StatusBadge value={approval.status} />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Requested {formatDate(approval.requested_at)} by {approval.requested_by_name}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{approval.message || "No message added."}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
