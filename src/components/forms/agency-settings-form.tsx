"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";

import { updateAgencySettingsAction } from "@/actions/studioflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { agencySettingsSchema } from "@/lib/validation/schemas";

export function AgencySettingsForm({
  defaultValues,
  disabled = false
}: {
  defaultValues: z.input<typeof agencySettingsSchema>;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const form = useForm<
    z.input<typeof agencySettingsSchema>,
    unknown,
    z.output<typeof agencySettingsSchema>
  >({
    defaultValues,
    resolver: zodResolver(agencySettingsSchema)
  });

  const onSubmit = form.handleSubmit((values) => {
    setIsPending(true);
    startTransition(async () => {
      const result = await updateAgencySettingsAction(values);
      setIsPending(false);

      if (!result.success) {
        toast.error(result.error ?? "Unable to update workspace settings.");
        return;
      }

      toast.success("Workspace settings updated.");
      router.refresh();
    });
  });

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="agency-name">Agency name</Label>
          <Input disabled={disabled || isPending} id="agency-name" {...form.register("name")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input disabled={disabled || isPending} id="website" placeholder="https://northline.studio" {...form.register("website")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="brand-primary">Primary brand color</Label>
          <Input disabled={disabled || isPending} id="brand-primary" placeholder="#0F766E" {...form.register("brandPrimaryColor")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="portal-headline">Portal headline</Label>
        <Input disabled={disabled || isPending} id="portal-headline" {...form.register("portalHeadline")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="portal-subheadline">Portal subheadline</Label>
        <Textarea disabled={disabled || isPending} id="portal-subheadline" rows={4} {...form.register("portalSubheadline")} />
      </div>
      <Button disabled={disabled || isPending} type="submit">
        {isPending ? "Saving..." : "Save branding and messaging"}
      </Button>
    </form>
  );
}
