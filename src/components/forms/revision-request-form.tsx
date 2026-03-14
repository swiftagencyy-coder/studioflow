"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";

import { createRevisionRequestAction } from "@/actions/studioflow";
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
import { revisionPriorityOptions } from "@/lib/constants";
import { revisionFormSchema } from "@/lib/validation/schemas";

export function RevisionRequestForm({
  projectId
}: {
  projectId: string;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const form = useForm<
    z.input<typeof revisionFormSchema>,
    unknown,
    z.output<typeof revisionFormSchema>
  >({
    defaultValues: {
      approvalRequestId: undefined,
      description: "",
      priority: "medium",
      status: "open",
      title: ""
    },
    resolver: zodResolver(revisionFormSchema)
  });

  const onSubmit = form.handleSubmit((values) => {
    setIsPending(true);
    startTransition(async () => {
      const result = await createRevisionRequestAction(projectId, values);
      setIsPending(false);

      if (!result.success) {
        toast.error(result.error ?? "Unable to save revision request.");
        return;
      }

      toast.success("Revision request added.");
      form.reset();
      router.refresh();
    });
  });

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="revision-title">Title</Label>
          <Input id="revision-title" {...form.register("title")} />
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Controller
            control={form.control}
            name="priority"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {revisionPriorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="revision-description">Description</Label>
        <Textarea id="revision-description" {...form.register("description")} />
      </div>
      <Button disabled={isPending} type="submit">
        {isPending ? "Saving..." : "Add revision request"}
      </Button>
    </form>
  );
}
