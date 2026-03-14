"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";

import { createInvitationAction } from "@/actions/studioflow";
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
import { invitationRoleOptions } from "@/lib/constants";
import { invitationFormSchema } from "@/lib/validation/schemas";

export function InviteMemberDialog({
  canInviteTeamMembers = true,
  clients
}: {
  canInviteTeamMembers?: boolean;
  clients: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const defaultRole = canInviteTeamMembers ? "team_member" : "client";
  const canSendAnyInvite = canInviteTeamMembers || clients.length > 0;
  const form = useForm<
    z.input<typeof invitationFormSchema>,
    unknown,
    z.output<typeof invitationFormSchema>
  >({
    defaultValues: {
      clientId: clients[0]?.id,
      email: "",
      fullName: "",
      role: defaultRole,
      title: ""
    },
    resolver: zodResolver(invitationFormSchema)
  });
  const selectedRole = form.watch("role");
  const roleOptions = canInviteTeamMembers
    ? invitationRoleOptions
    : invitationRoleOptions.filter((option) => option.value === "client");
  const clientInviteBlocked = selectedRole === "client" && clients.length === 0;

  const onSubmit = form.handleSubmit((values) => {
    setIsPending(true);
    startTransition(async () => {
      const result = await createInvitationAction(values);
      setIsPending(false);

      if (!result.success) {
        toast.error(result.error ?? "Unable to send invitation.");
        return;
      }

      toast.success("Invitation sent.");
      form.reset({
        clientId: clients[0]?.id,
        email: "",
        fullName: "",
        role: defaultRole,
        title: ""
      });
      setOpen(false);
      router.refresh();
    });
  });

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button disabled={!canSendAnyInvite}>Invite user</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite collaborator</DialogTitle>
          <DialogDescription>
            {canSendAnyInvite
              ? "Send a secure join link for a teammate or client contact."
              : "Create a client first before inviting someone into the portal."}
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label>Invite role</Label>
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.role ? (
              <p className="text-sm text-destructive">{form.formState.errors.role.message}</p>
            ) : null}
          </div>
          {selectedRole === "client" ? (
            <div className="space-y-2">
              <Label>Client</Label>
              {clients.length ? (
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
              ) : (
                <div className="rounded-2xl border border-dashed border-border/70 bg-secondary/30 p-3 text-sm text-muted-foreground">
                  Add a client before sending portal invitations.
                </div>
              )}
              {form.formState.errors.clientId ? (
                <p className="text-sm text-destructive">{form.formState.errors.clientId.message}</p>
              ) : null}
            </div>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="invite-full-name">Full name</Label>
              <Input id="invite-full-name" {...form.register("fullName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-title">Title</Label>
              <Input
                id="invite-title"
                placeholder={selectedRole === "client" ? "Marketing lead" : "Designer"}
                {...form.register("title")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input id="invite-email" type="email" {...form.register("email")} />
            {form.formState.errors.email ? (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            ) : null}
          </div>
          <Button disabled={isPending || clientInviteBlocked || !canSendAnyInvite} type="submit">
            {isPending ? "Sending..." : "Send invitation"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
