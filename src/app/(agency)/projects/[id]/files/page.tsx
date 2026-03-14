import Link from "next/link";

import { FileUploadPanel } from "@/components/forms/file-upload-panel";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjectDetail } from "@/lib/data/studioflow";
import { formatDate } from "@/lib/utils";

export default async function ProjectFilesPage({
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
        description="Upload project assets, onboarding files, and deliverables with scoped Supabase storage."
        eyebrow="Project files"
        title={`${detail.project.name} files`}
      />
      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUploadPanel
              agencyId={detail.project.agency_id}
              canUploadInternal
              clientId={detail.project.client_id}
              projectId={id}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Library</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {detail.files.map((file) => (
              <div key={file.id} className="rounded-2xl border border-border/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold">{file.file_name}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {file.category.replace(/_/g, " ")} · Uploaded {formatDate(file.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge value={file.visibility} />
                    {file.signedUrl ? (
                      <a
                        className="text-sm font-semibold text-primary"
                        href={file.signedUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Download
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
