"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";

import { createProposalAction } from "@/actions/studioflow";
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
import { proposalStatusOptions } from "@/lib/constants";
import { proposalFormSchema } from "@/lib/validation/schemas";

export function ProposalBuilderForm({
  projectId
}: {
  projectId: string;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const form = useForm<
    z.input<typeof proposalFormSchema>,
    unknown,
    z.output<typeof proposalFormSchema>
  >({
    defaultValues: {
      deliverables: "",
      items: [{ description: "", label: "", quantity: 1, unitPrice: 0 }],
      notes: "",
      revisionCount: 2,
      scope: "",
      status: "draft",
      timeline: "",
      title: ""
    },
    resolver: zodResolver(proposalFormSchema)
  });
  const itemFields = useFieldArray({
    control: form.control,
    name: "items"
  });

  const onSubmit = form.handleSubmit((values) => {
    setIsPending(true);
    startTransition(async () => {
      const result = await createProposalAction(projectId, values);
      setIsPending(false);

      if (!result.success) {
        toast.error(result.error ?? "Unable to save proposal.");
        return;
      }

      toast.success("Proposal saved.");
      form.reset();
      router.refresh();
    });
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="proposal-title">Title</Label>
          <Input id="proposal-title" {...form.register("title")} />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {proposalStatusOptions
                    .filter((option) => option.value === "draft" || option.value === "sent")
                    .map((option) => (
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
        <Label>Scope</Label>
        <Textarea {...form.register("scope")} />
      </div>
      <div className="space-y-2">
        <Label>Deliverables</Label>
        <Textarea {...form.register("deliverables")} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="proposal-timeline">Timeline</Label>
          <Input id="proposal-timeline" {...form.register("timeline")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="proposal-revisions">Revision count</Label>
          <Input id="proposal-revisions" type="number" {...form.register("revisionCount", { valueAsNumber: true })} />
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Line items</Label>
          <Button
            size="sm"
            type="button"
            variant="outline"
            onClick={() =>
              itemFields.append({ description: "", label: "", quantity: 1, unitPrice: 0 })
            }
          >
            <Plus className="h-4 w-4" />
            Add item
          </Button>
        </div>
        <div className="space-y-3">
          {itemFields.fields.map((field, index) => (
            <div key={field.id} className="rounded-3xl border border-border/80 p-4">
              <div className="grid gap-4 md:grid-cols-[1.2fr_1fr_0.7fr_0.7fr_auto]">
                <Input placeholder="Line item" {...form.register(`items.${index}.label`)} />
                <Input placeholder="Description" {...form.register(`items.${index}.description`)} />
                <Input type="number" {...form.register(`items.${index}.quantity`, { valueAsNumber: true })} />
                <Input type="number" {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })} />
                <Button
                  size="icon"
                  type="button"
                  variant="ghost"
                  onClick={() => itemFields.remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove item</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea {...form.register("notes")} />
      </div>
      <Button disabled={isPending} type="submit">
        {isPending ? "Saving..." : "Save proposal"}
      </Button>
    </form>
  );
}
