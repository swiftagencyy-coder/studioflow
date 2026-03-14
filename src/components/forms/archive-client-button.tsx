"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { toast } from "sonner";

import { archiveClientAction } from "@/actions/studioflow";
import { Button } from "@/components/ui/button";

export function ArchiveClientButton({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  return (
    <Button
      disabled={isPending}
      type="button"
      variant="outline"
      onClick={() => {
        setIsPending(true);
        startTransition(async () => {
          const result = await archiveClientAction(clientId);
          setIsPending(false);

          if (!result.success) {
            toast.error(result.error ?? "Unable to archive client.");
            return;
          }

          toast.success("Client archived.");
          router.refresh();
        });
      }}
    >
      Archive client
    </Button>
  );
}
