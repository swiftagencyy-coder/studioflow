import { FolderKanban } from "lucide-react";

import { ProjectsDirectory } from "@/components/dashboard/projects-directory";
import { CreateClientDialog } from "@/components/forms/create-client-dialog";
import { CreateProjectDialog } from "@/components/forms/create-project-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { requireAgencyWorkspace } from "@/lib/auth/context";
import { getAgencyClients, getAgencyProjects } from "@/lib/data/studioflow";

export default async function ProjectsPage() {
  const viewer = await requireAgencyWorkspace();
  const [clients, projects] = await Promise.all([
    getAgencyClients(viewer.agencyMembership.agency_id),
    getAgencyProjects(viewer.agencyMembership.agency_id)
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          clients.length ? (
            <CreateProjectDialog clients={clients.map((client) => ({ id: client.id, name: client.name }))} />
          ) : (
            <CreateClientDialog />
          )
        }
        description="Each project keeps onboarding, files, proposals, approvals, revisions, and invoices together."
        eyebrow="Project management"
        title="Projects"
      />
      <Card>
        <CardContent className="p-0">
          {projects.length ? (
            <ProjectsDirectory data={projects} />
          ) : !clients.length ? (
            <div className="p-6">
              <EmptyState
                action={<CreateClientDialog />}
                description="Create a client before you create a project so StudioFlow can scope access correctly."
                icon={FolderKanban}
                title="Add a client first"
              />
            </div>
          ) : (
            <div className="p-6">
              <EmptyState
                action={<CreateProjectDialog clients={clients.map((client) => ({ id: client.id, name: client.name }))} />}
                description="Spin up your first project to centralize client delivery."
                icon={FolderKanban}
                title="No projects yet"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
