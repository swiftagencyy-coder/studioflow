import { redirect } from "next/navigation";

import { AuthLoginForm } from "@/components/forms/auth-login-form";
import { getViewerContext, getViewerHomePath } from "@/lib/auth/context";

export default async function LoginPage() {
  const viewer = await getViewerContext();

  if (viewer) {
    redirect(getViewerHomePath(viewer));
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-serif text-4xl font-semibold">Welcome back</h1>
        <p className="text-sm leading-7 text-muted-foreground">
          Sign in to your workspace or client portal.
        </p>
      </div>
      <AuthLoginForm />
    </div>
  );
}
