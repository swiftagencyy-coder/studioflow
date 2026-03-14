"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";

import { submitOnboardingAction } from "@/actions/studioflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { onboardingSchema } from "@/lib/validation/schemas";
import type { TableRow } from "@/types/database";

export function OnboardingForm({
  existing,
  projectId
}: {
  existing: TableRow<"onboarding_submissions"> | null;
  projectId: string;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const form = useForm<z.infer<typeof onboardingSchema>>({
    defaultValues: {
      brandColors: existing?.brand_colors.join(", ") ?? "",
      businessDescription: existing?.business_description ?? "",
      competitorExamples: existing?.competitor_examples.join("\n") ?? "",
      deadlines: existing?.deadlines ?? "",
      designStylePreferences: existing?.design_style_preferences ?? "",
      extraNotes: existing?.extra_notes ?? "",
      fontPreferences: existing?.font_preferences ?? "",
      requiredPages: existing?.required_pages ?? "",
      targetAudience: existing?.target_audience ?? ""
    },
    resolver: zodResolver(onboardingSchema)
  });

  const onSubmit = form.handleSubmit((values) => {
    setIsPending(true);
    startTransition(async () => {
      const result = await submitOnboardingAction(projectId, values);
      setIsPending(false);

      if (!result.success) {
        toast.error(result.error ?? "Unable to save onboarding details.");
        return;
      }

      toast.success("Onboarding saved.");
      router.refresh();
    });
  });

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Business description</Label>
          <Textarea {...form.register("businessDescription")} />
        </div>
        <div className="space-y-2">
          <Label>Target audience</Label>
          <Textarea {...form.register("targetAudience")} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Design style preferences</Label>
          <Textarea {...form.register("designStylePreferences")} />
        </div>
        <div className="space-y-2">
          <Label>Required pages or services</Label>
          <Textarea {...form.register("requiredPages")} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Competitor examples</Label>
          <Textarea placeholder="One URL or reference per line" {...form.register("competitorExamples")} />
        </div>
        <div className="space-y-2">
          <Label>Brand colors</Label>
          <Input placeholder="#0F766E, warm white, slate" {...form.register("brandColors")} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Font preferences</Label>
          <Input {...form.register("fontPreferences")} />
        </div>
        <div className="space-y-2">
          <Label>Deadline or launch target</Label>
          <Input {...form.register("deadlines")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Extra notes</Label>
        <Textarea {...form.register("extraNotes")} />
      </div>
      <Button disabled={isPending} type="submit">
        {isPending ? "Saving..." : existing ? "Update onboarding" : "Submit onboarding"}
      </Button>
    </form>
  );
}
