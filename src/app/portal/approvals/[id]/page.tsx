import Link from "next/link";

import { ApprovalResponseForm } from "@/components/forms/approval-response-form";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPortalApproval } from "@/lib/data/studioflow";

export default async function PortalApprovalPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { approval, file } = await getPortalApproval(id);

  if (!approval) {
    return <div className="text-sm text-muted-foreground">Approval request not found.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description={approval.message || "Review the deliverable and respond with approval or requested changes."}
        eyebrow="Approval request"
        title={approval.title}
      />
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Deliverable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">Status</div>
              <StatusBadge value={approval.status} />
            </div>
            <p className="text-sm leading-7 text-muted-foreground">{approval.message}</p>
            {file?.signedUrl ? (
              <a
                className="font-semibold text-primary"
                href={file.signedUrl}
                rel="noreferrer"
                target="_blank"
              >
                Download review file
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">No file attached.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Respond</CardTitle>
          </CardHeader>
          <CardContent>
            <ApprovalResponseForm approvalRequestId={approval.id} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
