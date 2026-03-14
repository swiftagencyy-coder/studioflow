import { InvoiceForm } from "@/components/forms/invoice-form";
import { InvoiceStatusButton } from "@/components/forms/invoice-status-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjectDetail } from "@/lib/data/studioflow";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function ProjectInvoicesPage({
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
        description="Keep invoice visibility simple for the MVP while staying ready for future billing integrations."
        eyebrow="Invoices"
        title={`${detail.project.name} invoices`}
      />
      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Create invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <InvoiceForm projectId={id} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Invoice history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {detail.invoices.map((invoice) => (
              <div key={invoice.id} className="rounded-2xl border border-border/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{invoice.invoice_number}</div>
                  <StatusBadge value={invoice.status} />
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {formatCurrency(invoice.amount)} · Due {formatDate(invoice.due_date)}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{invoice.note || "No note added."}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {invoice.status !== "sent" ? <InvoiceStatusButton invoiceId={invoice.id} status="sent" /> : null}
                  {invoice.status !== "paid" ? <InvoiceStatusButton invoiceId={invoice.id} status="paid" /> : null}
                  {invoice.status !== "overdue" ? (
                    <InvoiceStatusButton invoiceId={invoice.id} status="overdue" />
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
