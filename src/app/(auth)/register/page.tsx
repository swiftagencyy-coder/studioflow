import { redirect } from "next/navigation";

import { AuthRegisterForm } from "@/components/forms/auth-register-form";
import { getViewerContext, getViewerHomePath } from "@/lib/auth/context";

export default async function RegisterPage() {
  const viewer = await getViewerContext();

  if (viewer) {
    redirect(getViewerHomePath(viewer));
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-serif text-4xl font-semibold">Create your StudioFlow workspace</h1>
        <p className="text-sm leading-7 text-muted-foreground">
          Start with an agency owner account, then configure your workspace and invite clients later.
        </p>
      </div>
      <AuthRegisterForm />
    </div>
  );
}
