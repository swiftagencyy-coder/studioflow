import { ProposalBuilderForm } from "@/components/forms/proposal-builder-form";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjectDetail } from "@/lib/data/studioflow";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function ProjectProposalPage({
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
        description="Build a proposal with itemized pricing and send it directly into the client portal."
        eyebrow="Proposal builder"
        title={`${detail.project.name} proposal`}
      />
      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Create proposal</CardTitle>
          </CardHeader>
          <CardContent>
            <ProposalBuilderForm projectId={id} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Proposal history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {detail.proposals.map((proposal) => (
              <div key={proposal.id} className="rounded-2xl border border-border/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{proposal.title}</div>
                  <StatusBadge value={proposal.status} />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {formatCurrency(proposal.pricing_total)} · {formatDate(proposal.created_at)}
                </div>
                <div className="mt-3 grid gap-2">
                  {proposal.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-2xl bg-secondary/50 px-3 py-2 text-sm">
                      <span>{item.label}</span>
                      <span>{formatCurrency(item.quantity * item.unit_price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
