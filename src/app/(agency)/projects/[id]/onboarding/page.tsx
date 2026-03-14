import { RequestOnboardingButton } from "@/components/forms/request-onboarding-button";
import { OnboardingForm } from "@/components/forms/onboarding-form";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjectDetail } from "@/lib/data/studioflow";
import { formatDate } from "@/lib/utils";

export default async function ProjectOnboardingPage({
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
        actions={<RequestOnboardingButton projectId={id} />}
        description={`Requested ${formatDate(detail.project.onboarding_requested_at)}`}
        eyebrow="Project onboarding"
        title={`${detail.project.name} onboarding`}
      />
      <Card>
        <CardHeader>
          <CardTitle>Questionnaire</CardTitle>
        </CardHeader>
        <CardContent>
          <OnboardingForm existing={detail.onboarding} projectId={id} />
        </CardContent>
      </Card>
    </div>
  );
}
