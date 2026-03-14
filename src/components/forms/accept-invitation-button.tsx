"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { toast } from "sonner";

import { acceptInvitationAction } from "@/actions/studioflow";
import { Button } from "@/components/ui/button";

export function AcceptInvitationButton({
  token
}: {
  token: string;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  return (
    <Button
      disabled={isPending}
      onClick={() => {
        setIsPending(true);
        startTransition(async () => {
          const result = await acceptInvitationAction(token);
          setIsPending(false);

          if (!result.success) {
            toast.error(result.error ?? "Unable to accept invitation.");
            return;
          }

          toast.success("Invitation accepted.");
          router.push((result.redirectTo ?? "/dashboard") as Route);
          router.refresh();
        });
      }}
      type="button"
    >
      {isPending ? "Joining..." : "Accept invitation"}
    </Button>
  );
}
