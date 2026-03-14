"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";

import { createProjectAction } from "@/actions/studioflow";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { projectStatusOptions, serviceTypeOptions } from "@/lib/constants";
import { projectFormSchema } from "@/lib/validation/schemas";

export function CreateProjectDialog({
  clients,
  defaultClientId,
  lockClient = false,
  trigger
}: {
  clients: Array<{ id: string; name: string }>;
  defaultClientId?: string;
  lockClient?: boolean;
  trigger?: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const hasClients = clients.length > 0;
  const initialClientId =
    defaultClientId && clients.some((client) => client.id === defaultClientId)
      ? defaultClientId
      : (clients[0]?.id ?? "");
  const currentClientName = clients.find((client) => client.id === initialClientId)?.name ?? "";
  const form = useForm<
    z.input<typeof projectFormSchema>,
    unknown,
    z.output<typeof projectFormSchema>
  >({
    defaultValues: {
      clientId: initialClientId,
      description: "",
      dueDate: "",
      internalNotes: "",
      name: "",
      portalSummary: "",
      serviceType: serviceTypeOptions[0],
      status: "lead"
    },
    resolver: zodResolver(projectFormSchema)
  });

  const onSubmit = form.handleSubmit((values) => {
    if (!hasClients) {
      toast.error("Add a client before creating a project.");
      return;
    }

    setIsPending(true);
    startTransition(async () => {
      const result = await createProjectAction(values);
      setIsPending(false);

      if (!result.success) {
        toast.error(result.error ?? "Unable to create project.");
        return;
      }

      toast.success("Project created.");
      form.reset();
      setOpen(false);
      router.push(`/projects/${result.data?.projectId ?? ""}` as Route);
      router.refresh();
    });
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button>Create project</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>
            Kick off a new engagement and define what the client sees in the portal.
          </DialogDescription>
        </DialogHeader>
        {!hasClients ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-secondary/30 p-4 text-sm text-muted-foreground">
            Add a client first, then create the project from here or directly from that client record.
          </div>
        ) : (
          <form className="grid gap-4" onSubmit={onSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Client</Label>
                {lockClient ? (
                  <div className="rounded-xl border border-border/70 bg-secondary/30 px-3 py-2 text-sm font-medium">
                    {currentClientName}
                  </div>
                ) : (
                  <Controller
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
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
                        {projectStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-name">Project name</Label>
                <Input id="project-name" {...form.register("name")} />
              </div>
              <div className="space-y-2">
                <Label>Service type</Label>
                <Controller
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceTypeOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="due-date">Due date</Label>
                <Input id="due-date" type="date" {...form.register("dueDate")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...form.register("description")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portal-summary">Client-facing summary</Label>
              <Textarea id="portal-summary" {...form.register("portalSummary")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="internal-notes">Internal notes</Label>
              <Textarea id="internal-notes" {...form.register("internalNotes")} />
            </div>
            <Button disabled={isPending} type="submit">
              {isPending ? "Saving..." : "Save project"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
