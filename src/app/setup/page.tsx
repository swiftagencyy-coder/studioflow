import { redirect } from "next/navigation";

import { AgencySetupForm } from "@/components/forms/agency-setup-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireViewer, getViewerHomePath } from "@/lib/auth/context";

export default async function SetupPage() {
  const viewer = await requireViewer();

  if (viewer.clientMembership) {
    redirect("/portal");
  }

  if (viewer.agencyMembership) {
    redirect(getViewerHomePath(viewer));
  }

  return (
    <div className="min-h-screen px-4 py-10 lg:px-6">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="overflow-hidden">
          <CardContent className="space-y-6 bg-gradient-to-br from-primary/10 to-transparent p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Workspace setup
            </div>
            <h1 className="font-serif text-5xl font-semibold leading-tight">
              Name your studio and start bringing client work into one place.
            </h1>
            <p className="text-sm leading-8 text-muted-foreground">
              Once the workspace exists, you can create clients, launch onboarding, send proposals,
              upload deliverables, and track invoice status from the same system.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Finish setup</CardTitle>
          </CardHeader>
          <CardContent>
            <AgencySetupForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
