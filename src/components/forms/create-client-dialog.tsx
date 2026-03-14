"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState, startTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";

import { createClientAction } from "@/actions/studioflow";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { clientFormSchema } from "@/lib/validation/schemas";

export function CreateClientDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const form = useForm<
    z.input<typeof clientFormSchema>,
    unknown,
    z.output<typeof clientFormSchema>
  >({
    defaultValues: {
      contactName: "",
      email: "",
      name: "",
      notes: "",
      phone: "",
      status: "active",
      tags: ""
    },
    resolver: zodResolver(clientFormSchema)
  });

  const onSubmit = form.handleSubmit((values) => {
    setIsPending(true);
    startTransition(async () => {
      const result = await createClientAction(values);
      setIsPending(false);

      if (!result.success) {
        toast.error(result.error ?? "Unable to create client.");
        return;
      }

      toast.success("Client created.");
      form.reset();
      setOpen(false);
      router.push(`/clients/${result.data?.clientId ?? ""}` as Route);
      router.refresh();
    });
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create client</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create client</DialogTitle>
          <DialogDescription>
            Add a company contact and keep internal notes private to your team.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client-name">Company name</Label>
              <Input id="client-name" {...form.register("name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-name">Contact person</Label>
              <Input id="contact-name" {...form.register("contactName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-email">Email</Label>
              <Input id="client-email" type="email" {...form.register("email")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-phone">Phone</Label>
              <Input id="client-phone" {...form.register("phone")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-tags">Tags</Label>
            <Input id="client-tags" placeholder="branding, retainer, high-touch" {...form.register("tags")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client-notes">Internal notes</Label>
            <Textarea id="client-notes" {...form.register("notes")} />
          </div>
          <Button disabled={isPending} type="submit">
            {isPending ? "Saving..." : "Save client"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
