"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";

import { respondToProposalAction } from "@/actions/studioflow";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { proposalDecisionSchema } from "@/lib/validation/schemas";

export function ProposalResponseForm({
  proposalId
}: {
  proposalId: string;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const form = useForm<z.infer<typeof proposalDecisionSchema>>({
    defaultValues: {
      proposalId,
      responseBody: "",
      status: "accepted"
    },
    resolver: zodResolver(proposalDecisionSchema)
  });

  function submit(status: "accepted" | "rejected") {
    setIsPending(true);
    startTransition(async () => {
      const result = await respondToProposalAction({
        ...form.getValues(),
        status
      });
      setIsPending(false);

      if (!result.success) {
        toast.error(result.error ?? "Unable to submit response.");
        return;
      }

      toast.success(status === "accepted" ? "Proposal accepted." : "Proposal declined.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Response note</Label>
        <Textarea {...form.register("responseBody")} />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button disabled={isPending} type="button" onClick={() => submit("accepted")}>
          Accept proposal
        </Button>
        <Button
          disabled={isPending}
          type="button"
          variant="outline"
          onClick={() => submit("rejected")}
        >
          Reject proposal
        </Button>
      </div>
    </div>
  );
}
