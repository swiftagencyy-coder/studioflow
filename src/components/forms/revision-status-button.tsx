"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { toast } from "sonner";

import { updateRevisionStatusAction } from "@/actions/studioflow";
import { Button } from "@/components/ui/button";
import type { TableRow } from "@/types/database";

export function RevisionStatusButton({
  revisionId,
  status
}: {
  revisionId: string;
  status: TableRow<"revision_requests">["status"];
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
          const result = await updateRevisionStatusAction(revisionId, status);
          setIsPending(false);

          if (!result.success) {
            toast.error(result.error ?? "Unable to update revision.");
            return;
          }

          toast.success("Revision updated.");
          router.refresh();
        });
      }}
    >
      Mark {status.replace(/_/g, " ")}
    </Button>
  );
}
