"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";

import { respondToApprovalAction } from "@/actions/studioflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { approvalDecisionWithRevisionSchema } from "@/lib/validation/schemas";

export function ApprovalResponseForm({
  approvalRequestId
}: {
  approvalRequestId: string;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const form = useForm<z.infer<typeof approvalDecisionWithRevisionSchema>>({
    defaultValues: {
      approvalRequestId,
      responseBody: "",
      revisionDescription: "",
      revisionTitle: "",
      status: "approved"
    },
    resolver: zodResolver(approvalDecisionWithRevisionSchema)
  });

  function submit(status: "approved" | "changes_requested") {
    setIsPending(true);
    startTransition(async () => {
      const result = await respondToApprovalAction({
        ...form.getValues(),
        status
      });
      setIsPending(false);

      if (!result.success) {
        toast.error(result.error ?? "Unable to submit response.");
        return;
      }

      toast.success(status === "approved" ? "Deliverable approved." : "Changes requested.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Feedback</Label>
        <Textarea {...form.register("responseBody")} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Revision title</Label>
          <Input {...form.register("revisionTitle")} />
        </div>
        <div className="space-y-2">
          <Label>Revision details</Label>
          <Input {...form.register("revisionDescription")} />
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button disabled={isPending} type="button" onClick={() => submit("approved")}>
          Approve
        </Button>
        <Button
          disabled={isPending}
          type="button"
          variant="outline"
          onClick={() => submit("changes_requested")}
        >
          Request changes
        </Button>
      </div>
    </div>
  );
}
