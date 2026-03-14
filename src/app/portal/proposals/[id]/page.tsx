import { ProposalResponseForm } from "@/components/forms/proposal-response-form";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPortalProposal } from "@/lib/data/studioflow";
import { formatCurrency } from "@/lib/utils";

export default async function PortalProposalPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { items, proposal } = await getPortalProposal(id);

  if (!proposal) {
    return <div className="text-sm text-muted-foreground">Proposal not found.</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description={proposal.timeline}
        eyebrow="Proposal"
        title={proposal.title}
      />
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Proposal details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm text-muted-foreground">Status</div>
              <StatusBadge value={proposal.status} />
            </div>
            <div className="text-sm leading-7 text-muted-foreground">{proposal.scope}</div>
            <div className="grid gap-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl border border-border/70 px-4 py-3">
                  <div>
                    <div className="font-semibold">{item.label}</div>
                    <div className="text-sm text-muted-foreground">{item.description}</div>
                  </div>
                  <div className="font-semibold">{formatCurrency(item.quantity * item.unit_price)}</div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl bg-secondary/50 p-4 text-sm">
              <div className="text-muted-foreground">Total</div>
              <div className="mt-2 text-2xl font-semibold">{formatCurrency(proposal.pricing_total)}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Respond</CardTitle>
          </CardHeader>
          <CardContent>
            <ProposalResponseForm proposalId={proposal.id} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
