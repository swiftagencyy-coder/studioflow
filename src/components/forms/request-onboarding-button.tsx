"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { toast } from "sonner";

import { requestOnboardingAction } from "@/actions/studioflow";
import { Button } from "@/components/ui/button";

export function RequestOnboardingButton({ projectId }: { projectId: string }) {
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
          const result = await requestOnboardingAction(projectId);
          setIsPending(false);

          if (!result.success) {
            toast.error(result.error ?? "Unable to request onboarding.");
            return;
          }

          toast.success("Onboarding request sent.");
          router.refresh();
        });
      }}
    >
      Send onboarding
    </Button>
  );
}
