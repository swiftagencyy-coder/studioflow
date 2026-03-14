import { Users } from "lucide-react";

import { ClientsDirectory } from "@/components/dashboard/clients-directory";
import { CreateClientDialog } from "@/components/forms/create-client-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { requireAgencyWorkspace } from "@/lib/auth/context";
import { getAgencyClients } from "@/lib/data/studioflow";

export default async function ClientsPage() {
  const viewer = await requireAgencyWorkspace();
  const clients = await getAgencyClients(viewer.agencyMembership.agency_id);

  return (
    <div className="space-y-6">
      <PageHeader
        actions={<CreateClientDialog />}
        description="Manage clients, their projects, proposal history, files, invoices, and activity."
        eyebrow="Client management"
        title="Clients"
      />
      <Card>
        <CardContent className="p-0">
          {clients.length ? (
            <ClientsDirectory data={clients} />
          ) : (
            <div className="p-6">
              <EmptyState
                action={<CreateClientDialog />}
                description="Add your first client to start organizing projects, files, and approvals."
                icon={Users}
                title="No clients yet"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
