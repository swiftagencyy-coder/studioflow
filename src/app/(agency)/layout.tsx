import { AppShell } from "@/components/layout/app-shell";
import { requireAgencyWorkspace } from "@/lib/auth/context";

export default async function AgencyLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const viewer = await requireAgencyWorkspace();

  return (
    <AppShell
      subtitle={viewer.agencyMembership.agency?.name ?? "Agency workspace"}
      userName={viewer.profile.full_name}
    >
      {children}
    </AppShell>
  );
}
