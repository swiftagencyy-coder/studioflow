import { PortalShell } from "@/components/layout/portal-shell";
import { requireClientViewer } from "@/lib/auth/context";

export default async function PortalLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const viewer = await requireClientViewer();

  return (
    <PortalShell
      companyName={viewer.clientMembership.client?.name ?? "Client portal"}
      userName={viewer.profile.full_name}
    >
      {children}
    </PortalShell>
  );
}
