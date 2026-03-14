"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";

import { createApprovalRequestAction } from "@/actions/studioflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { approvalFormSchema } from "@/lib/validation/schemas";

export function ApprovalRequestForm({
  deliverableFiles,
  projectId
}: {
  deliverableFiles: Array<{ id: string; fileName: string }>;
  projectId: string;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const form = useForm<z.infer<typeof approvalFormSchema>>({
    defaultValues: {
      deliverableFileId: deliverableFiles[0]?.id ?? "",
      message: "",
      title: ""
    },
    resolver: zodResolver(approvalFormSchema)
  });

  const onSubmit = form.handleSubmit((values) => {
    setIsPending(true);
    startTransition(async () => {
      const result = await createApprovalRequestAction(projectId, values);
      setIsPending(false);

      if (!result.success) {
        toast.error(result.error ?? "Unable to request approval.");
        return;
      }

      toast.success("Approval request sent.");
      form.reset();
      router.refresh();
    });
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="approval-title">Title</Label>
        <Input id="approval-title" {...form.register("title")} />
      </div>
      <div className="space-y-2">
        <Label>Deliverable</Label>
        <Controller
          control={form.control}
          name="deliverableFileId"
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a deliverable" />
              </SelectTrigger>
              <SelectContent>
                {deliverableFiles.map((file) => (
                  <SelectItem key={file.id} value={file.id}>
                    {file.fileName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="space-y-2">
        <Label>Message</Label>
        <Textarea {...form.register("message")} />
      </div>
      <Button disabled={isPending} type="submit">
        {isPending ? "Sending..." : "Send approval request"}
      </Button>
    </form>
  );
}
