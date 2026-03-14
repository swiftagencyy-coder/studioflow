"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";

import { setupAgencyAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { agencySetupSchema } from "@/lib/validation/schemas";

export function AgencySetupForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const form = useForm<z.infer<typeof agencySetupSchema>>({
    defaultValues: {
      agencyName: ""
    },
    resolver: zodResolver(agencySetupSchema)
  });

  const onSubmit = form.handleSubmit((values) => {
    setIsPending(true);
    startTransition(async () => {
      const result = await setupAgencyAction(values);
      setIsPending(false);

      if (!result.success) {
        toast.error(result.error ?? "Unable to create workspace.");
        return;
      }

      toast.success("Workspace ready.");
      router.push((result.redirectTo ?? "/dashboard") as Route);
      router.refresh();
    });
  });

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="agencyName">Studio or agency name</Label>
        <Input id="agencyName" placeholder="Northline Studio" {...form.register("agencyName")} />
        {form.formState.errors.agencyName ? (
          <p className="text-sm text-destructive">{form.formState.errors.agencyName.message}</p>
        ) : null}
      </div>
      <Button disabled={isPending} type="submit">
        {isPending ? "Creating workspace..." : "Enter StudioFlow"}
      </Button>
    </form>
  );
}
