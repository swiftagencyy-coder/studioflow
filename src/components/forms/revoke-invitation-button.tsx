"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { toast } from "sonner";

import { revokeInvitationAction } from "@/actions/studioflow";
import { Button } from "@/components/ui/button";

export function RevokeInvitationButton({
  invitationId
}: {
  invitationId: string;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  return (
    <Button
      disabled={isPending}
      size="sm"
      type="button"
      variant="outline"
      onClick={() => {
        setIsPending(true);
        startTransition(async () => {
          const result = await revokeInvitationAction(invitationId);
          setIsPending(false);

          if (!result.success) {
            toast.error(result.error ?? "Unable to revoke invitation.");
            return;
          }

          toast.success("Invitation revoked.");
          router.refresh();
        });
      }}
    >
      {isPending ? "Revoking..." : "Revoke"}
    </Button>
  );
}
