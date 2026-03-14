import { PortalShell } from "@/components/layout/portal-shell";
import { requireViewer } from "@/lib/auth/context";

export default async function PortalLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const viewer = await requireViewer();

  return (
    <PortalShell
      companyName={
        viewer.clientMembership?.client?.name ??
        viewer.agencyMembership?.agency?.name ??
        "Awaiting portal access"
      }
      subtitle={
        viewer.clientMembership
          ? "Client portal"
          : viewer.agencyMembership
            ? "Portal preview"
            : "Pending access"
      }
      userName={viewer.profile.full_name}
    >
      {children}
    </PortalShell>
  );
}
