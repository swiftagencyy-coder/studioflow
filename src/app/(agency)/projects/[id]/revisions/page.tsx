import { RevisionRequestForm } from "@/components/forms/revision-request-form";
import { RevisionStatusButton } from "@/components/forms/revision-status-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjectDetail } from "@/lib/data/studioflow";
import { formatDate } from "@/lib/utils";

export default async function ProjectRevisionsPage({
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
        description="Track requested changes as dedicated records instead of burying them in comment threads."
        eyebrow="Revisions"
        title={`${detail.project.name} revisions`}
      />
      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <CardTitle>Add revision request</CardTitle>
          </CardHeader>
          <CardContent>
            <RevisionRequestForm projectId={id} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revision queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {detail.revisions.map((revision) => (
              <div key={revision.id} className="rounded-2xl border border-border/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{revision.title}</div>
                  <StatusBadge value={revision.status} />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {revision.submitted_by_name} · {formatDate(revision.created_at)} · {revision.priority}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{revision.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {revision.status !== "in_review" ? (
                    <RevisionStatusButton revisionId={revision.id} status="in_review" />
                  ) : null}
                  {revision.status !== "in_progress" ? (
                    <RevisionStatusButton revisionId={revision.id} status="in_progress" />
                  ) : null}
                  {revision.status !== "resolved" ? (
                    <RevisionStatusButton revisionId={revision.id} status="resolved" />
                  ) : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
