import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Use at least 8 characters.")
});

export const loginWithInviteSchema = loginSchema.extend({
  inviteToken: z.string().min(8).optional()
});

export const registerSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2, "Enter your full name."),
  password: z.string().min(8, "Use at least 8 characters.")
});

export const registerWithInviteSchema = registerSchema.extend({
  inviteToken: z.string().min(8).optional()
});

export const agencySetupSchema = z.object({
  agencyName: z.string().min(2, "Add your studio or agency name.")
});

export const agencySettingsSchema = z.object({
  brandPrimaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Use a hex color like #0F766E."),
  name: z.string().min(2, "Add your agency name."),
  portalHeadline: z.string().min(8, "Add a stronger client-facing headline.").max(120),
  portalSubheadline: z.string().min(12, "Add a short supporting message.").max(220),
  website: z.string().url("Enter a valid website URL.").optional().or(z.literal(""))
});

export const profileSchema = z.object({
  fullName: z.string().min(2),
  avatarUrl: z.string().url().optional().or(z.literal(""))
});

export const clientFormSchema = z.object({
  contactName: z.string().min(2),
  email: z.string().email(),
  name: z.string().min(2),
  notes: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(["active", "archived"]).default("active"),
  tags: z.string().optional()
});

export const projectFormSchema = z.object({
  clientId: z.string().uuid(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  internalNotes: z.string().optional(),
  name: z.string().min(2),
  portalSummary: z.string().optional(),
  serviceType: z.string().min(2),
  status: z.enum([
    "lead",
    "onboarding",
    "in_progress",
    "waiting_on_client",
    "review",
    "approved",
    "completed"
  ])
});

export const onboardingSchema = z.object({
  brandColors: z.string().optional(),
  businessDescription: z.string().min(10),
  competitorExamples: z.string().optional(),
  deadlines: z.string().optional(),
  designStylePreferences: z.string().optional(),
  extraNotes: z.string().optional(),
  fontPreferences: z.string().optional(),
  requiredPages: z.string().optional(),
  targetAudience: z.string().min(6)
});

export const proposalItemSchema = z.object({
  description: z.string().optional(),
  label: z.string().min(2),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().nonnegative()
});

export const proposalFormSchema = z.object({
  deliverables: z.string().min(6),
  items: z.array(proposalItemSchema).min(1),
  notes: z.string().optional(),
  revisionCount: z.coerce.number().int().nonnegative(),
  scope: z.string().min(10),
  status: z.enum(["draft", "sent", "accepted", "rejected"]).default("draft"),
  timeline: z.string().min(3),
  title: z.string().min(2)
});

export const approvalFormSchema = z.object({
  deliverableFileId: z.string().uuid(),
  message: z.string().optional(),
  title: z.string().min(2)
});

export const approvalResponseSchema = z.object({
  decision: z.enum(["approved", "changes_requested"]),
  responseBody: z.string().optional()
});

export const revisionFormSchema = z.object({
  approvalRequestId: z.string().uuid().optional(),
  description: z.string().min(10),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  status: z.enum(["open", "in_review", "in_progress", "resolved"]).default("open"),
  title: z.string().min(2)
});

export const invitationFormSchema = z
  .object({
    clientId: z.string().uuid().optional(),
    email: z.string().email(),
    fullName: z.string().optional(),
    role: z.enum(["team_member", "client"]),
    title: z.string().optional()
  })
  .superRefine((value, ctx) => {
    if (value.role === "client" && !value.clientId) {
      ctx.addIssue({
        code: "custom",
        message: "Select a client for client portal invitations.",
        path: ["clientId"]
      });
    }
  });

export const invoiceFormSchema = z.object({
  amount: z.coerce.number().nonnegative(),
  dueDate: z.string().min(1),
  invoiceNumber: z.string().min(2),
  note: z.string().optional(),
  status: z.enum(["draft", "sent", "paid", "overdue"]).default("draft")
});

export const fileMetadataSchema = z.object({
  bucket: z.enum(["project-assets", "deliverables", "onboarding-files"]),
  category: z.enum([
    "logo",
    "brand_asset",
    "document",
    "deliverable",
    "reference",
    "onboarding_asset"
  ]),
  fileName: z.string().min(1),
  mimeType: z.string().optional(),
  projectId: z.string().uuid(),
  sizeBytes: z.number().int().nonnegative(),
  storagePath: z.string().min(1),
  visibility: z.enum(["internal", "client"]).default("client")
});

export const proposalDecisionSchema = z.object({
  proposalId: z.string().uuid(),
  responseBody: z.string().optional(),
  status: z.enum(["accepted", "rejected"])
});

export const approvalDecisionWithRevisionSchema = z.object({
  approvalRequestId: z.string().uuid(),
  responseBody: z.string().optional(),
  status: z.enum(["approved", "changes_requested"]),
  revisionDescription: z.string().optional(),
  revisionTitle: z.string().optional()
});
