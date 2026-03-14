"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";

import { createInvoiceAction } from "@/actions/studioflow";
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
import { invoiceStatusOptions } from "@/lib/constants";
import { invoiceFormSchema } from "@/lib/validation/schemas";

export function InvoiceForm({
  projectId
}: {
  projectId: string;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const form = useForm<
    z.input<typeof invoiceFormSchema>,
    unknown,
    z.output<typeof invoiceFormSchema>
  >({
    defaultValues: {
      amount: 0,
      dueDate: "",
      invoiceNumber: "",
      note: "",
      status: "draft"
    },
    resolver: zodResolver(invoiceFormSchema)
  });

  const onSubmit = form.handleSubmit((values) => {
    setIsPending(true);
    startTransition(async () => {
      const result = await createInvoiceAction(projectId, values);
      setIsPending(false);

      if (!result.success) {
        toast.error(result.error ?? "Unable to create invoice.");
        return;
      }

      toast.success("Invoice saved.");
      form.reset();
      router.refresh();
    });
  });

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="invoice-number">Invoice number</Label>
          <Input id="invoice-number" {...form.register("invoiceNumber")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoice-amount">Amount</Label>
          <Input id="invoice-amount" step="0.01" type="number" {...form.register("amount", { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoice-due-date">Due date</Label>
          <Input id="invoice-due-date" type="date" {...form.register("dueDate")} />
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
                  {invoiceStatusOptions.map((option) => (
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
        <Label htmlFor="invoice-note">Note</Label>
        <Textarea id="invoice-note" {...form.register("note")} />
      </div>
      <Button disabled={isPending} type="submit">
        {isPending ? "Saving..." : "Save invoice"}
      </Button>
    </form>
  );
}
