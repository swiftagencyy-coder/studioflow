"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/actions/auth";
import {
  requireAgencyWorkspace,
  requireClientViewer,
  requireViewer
} from "@/lib/auth/context";
import { getServerEnv } from "@/lib/env";
import {
  renderNotificationTemplate,
  sendNotificationEmail
} from "@/lib/notifications";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  approvalDecisionWithRevisionSchema,
  approvalFormSchema,
  clientFormSchema,
  fileMetadataSchema,
  invoiceFormSchema,
  onboardingSchema,
  projectFormSchema,
  proposalDecisionSchema,
  proposalFormSchema,
  revisionFormSchema
} from "@/lib/validation/schemas";
import type { TableInsert, TableRow } from "@/types/database";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

function parseTagString(value?: string) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildAppUrl(path: string) {
  const env = getServerEnv();
  return new URL(path, env.NEXT_PUBLIC_APP_URL).toString();
}

async function logActivity(entry: TableInsert<"activity_logs">) {
  const supabase = await createSupabaseServerClient();
  await supabase.from("activity_logs").insert(entry);
}

async function getProjectNotificationData(projectId: string) {
  const admin = createSupabaseAdminClient();
  const { data: project } = await admin
    .from("projects")
    .select("id, name, client_id, agency_id")
    .eq("id", projectId)
    .single();

  if (!project) {
    return null;
  }

  const [{ data: client }, { data: members }] = await Promise.all([
    admin.from("clients").select("id, name, email, contact_name").eq("id", project.client_id).single(),
    admin
      .from("agency_members")
      .select("user_id")
      .eq("agency_id", project.agency_id)
      .eq("is_active", true)
  ]);

  const memberIds = (members ?? []).map((member) => member.user_id);
  const { data: profiles } = memberIds.length
    ? await admin.from("profiles").select("id, email, full_name").in("id", memberIds)
    : { data: [] as Pick<TableRow<"profiles">, "id" | "email" | "full_name">[] };

  return {
    agencyRecipients: (profiles ?? []).map((profile) => profile.email),
    client,
    project
  };
}

function revalidateProjectPaths(projectId: string, clientId?: string | null) {
  revalidatePath("/dashboard");
  revalidatePath("/clients");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/onboarding`);
  revalidatePath(`/projects/${projectId}/files`);
  revalidatePath(`/projects/${projectId}/proposal`);
  revalidatePath(`/projects/${projectId}/approvals`);
  revalidatePath(`/projects/${projectId}/revisions`);
  revalidatePath(`/projects/${projectId}/invoices`);
  revalidatePath("/portal");
  revalidatePath(`/portal/projects/${projectId}`);

  if (clientId) {
    revalidatePath(`/clients/${clientId}`);
  }
}

export async function createClientAction(input: unknown): Promise<ActionResult<{ clientId: string }>> {
  const parsed = clientFormSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid client details.", success: false };
  }

  try {
    const viewer = await requireAgencyWorkspace();
    const supabase = await createSupabaseServerClient();

    const { data: client, error } = await supabase
      .from("clients")
      .insert({
        agency_id: viewer.agencyMembership.agency_id,
        contact_name: parsed.data.contactName,
        created_by: viewer.userId,
        email: parsed.data.email,
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        status: parsed.data.status,
        tags: parseTagString(parsed.data.tags)
      })
      .select("*")
      .single();

    if (error || !client) {
      throw error ?? new Error("Client could not be created.");
    }

    await supabase.from("client_private_details").upsert({
      client_id: client.id,
      notes: parsed.data.notes || null
    });

    await logActivity({
      action: "client_created",
      actor_name: viewer.profile.full_name,
      actor_user_id: viewer.userId,
      client_id: client.id,
      entity_id: client.id,
      entity_type: "client",
      message: `Added ${client.name} to the client roster.`,
      visibility: "internal"
    });

    revalidatePath("/clients");
    revalidatePath("/dashboard");

    return { data: { clientId: client.id }, success: true };
  } catch (error) {
    return { error: getErrorMessage(error), success: false };
  }
}

export async function archiveClientAction(clientId: string): Promise<ActionResult> {
  try {
    const viewer = await requireAgencyWorkspace();
    const supabase = await createSupabaseServerClient();
    const { data: client, error } = await supabase
      .from("clients")
      .update({
        archived_at: new Date().toISOString(),
        status: "archived"
      })
      .eq("id", clientId)
      .select("*")
      .single();

    if (error || !client) {
      throw error ?? new Error("Client could not be archived.");
    }

    await logActivity({
      action: "client_updated",
      actor_name: viewer.profile.full_name,
      actor_user_id: viewer.userId,
      client_id: client.id,
      entity_id: client.id,
      entity_type: "client",
      message: `Archived ${client.name}.`,
      visibility: "internal"
    });

    revalidatePath("/clients");
    revalidatePath(`/clients/${clientId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    return { error: getErrorMessage(error), success: false };
  }
}

export async function createProjectAction(input: unknown): Promise<ActionResult<{ projectId: string }>> {
  const parsed = projectFormSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid project details.", success: false };
  }

  try {
    const viewer = await requireAgencyWorkspace();
    const supabase = await createSupabaseServerClient();

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        agency_id: viewer.agencyMembership.agency_id,
        client_id: parsed.data.clientId,
        created_by: viewer.userId,
        description: parsed.data.description || null,
        due_date: parsed.data.dueDate || null,
        name: parsed.data.name,
        portal_summary: parsed.data.portalSummary || null,
        service_type: parsed.data.serviceType,
        status: parsed.data.status
      })
      .select("*")
      .single();

    if (error || !project) {
      throw error ?? new Error("Project could not be created.");
    }

    if (parsed.data.internalNotes) {
      await supabase.from("project_private_details").upsert({
        internal_notes: parsed.data.internalNotes,
        project_id: project.id
      });
    }

    await logActivity({
      action: "project_created",
      actor_name: viewer.profile.full_name,
      actor_user_id: viewer.userId,
      client_id: project.client_id,
      entity_id: project.id,
      entity_type: "project",
      message: `Created ${project.name}.`,
      project_id: project.id,
      visibility: "internal"
    });

    revalidateProjectPaths(project.id, project.client_id);

    return { data: { projectId: project.id }, success: true };
  } catch (error) {
    return { error: getErrorMessage(error), success: false };
  }
}

export async function requestOnboardingAction(projectId: string): Promise<ActionResult> {
  try {
    const viewer = await requireAgencyWorkspace();
    const supabase = await createSupabaseServerClient();
    const notificationData = await getProjectNotificationData(projectId);

    const { data: project, error } = await supabase
      .from("projects")
      .update({
        onboarding_requested_at: new Date().toISOString(),
        status: "onboarding"
      })
      .eq("id", projectId)
      .select("*")
      .single();

    if (error || !project) {
      throw error ?? new Error("Could not send onboarding request.");
    }

    await logActivity({
      action: "onboarding_requested",
      actor_name: viewer.profile.full_name,
      actor_user_id: viewer.userId,
      client_id: project.client_id,
      entity_id: project.id,
      entity_type: "project",
      message: `Requested onboarding details for ${project.name}.`,
      project_id: project.id,
      visibility: "client"
    });

    if (notificationData?.client?.email) {
      await sendNotificationEmail({
        html: renderNotificationTemplate({
          ctaHref: buildAppUrl(`/portal/projects/${projectId}`),
          ctaLabel: "Open onboarding",
          intro: `Your studio team has opened the onboarding checklist for ${notificationData.project.name}.`,
          title: "New onboarding request"
        }),
        subject: `StudioFlow: onboarding requested for ${notificationData.project.name}`,
        to: [notificationData.client.email]
      });
    }

    revalidateProjectPaths(project.id, project.client_id);

    return { success: true };
  } catch (error) {
    return { error: getErrorMessage(error), success: false };
  }
}

export async function submitOnboardingAction(
  projectId: string,
  input: unknown
): Promise<ActionResult> {
  const parsed = onboardingSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid onboarding details.", success: false };
  }

  try {
    const viewer = await requireViewer();
    const supabase = await createSupabaseServerClient();
    const brandColors = parsed.data.brandColors
      ? parsed.data.brandColors.split(",").map((value) => value.trim()).filter(Boolean)
      : [];
    const competitorExamples = parsed.data.competitorExamples
      ? parsed.data.competitorExamples.split("\n").map((value) => value.trim()).filter(Boolean)
      : [];

    const { error } = await supabase.from("onboarding_submissions").upsert(
      {
        brand_colors: brandColors,
        business_description: parsed.data.businessDescription,
        competitor_examples: competitorExamples,
        deadlines: parsed.data.deadlines || null,
        design_style_preferences: parsed.data.designStylePreferences || null,
        extra_notes: parsed.data.extraNotes || null,
        font_preferences: parsed.data.fontPreferences || null,
        project_id: projectId,
        required_pages: parsed.data.requiredPages || null,
        submitted_by: viewer.userId,
        target_audience: parsed.data.targetAudience
      },
      {
        onConflict: "project_id"
      }
    );

    if (error) {
      throw error;
    }

    const projectUpdate: Partial<TableInsert<"projects">> = {
      onboarding_completed_at: new Date().toISOString()
    };

    if (viewer.clientMembership) {
      projectUpdate.status = "review";
    }

    const { data: project } = await supabase
      .from("projects")
      .update(projectUpdate)
      .eq("id", projectId)
      .select("*")
      .single();

    await logActivity({
      action: "onboarding_submitted",
      actor_name: viewer.profile.full_name,
      actor_user_id: viewer.userId,
      client_id: project?.client_id ?? viewer.clientMembership?.client_id ?? null,
      entity_id: projectId,
      entity_type: "project",
      message: `${viewer.profile.full_name} submitted onboarding details.`,
      project_id: projectId,
      visibility: "client"
    });

    revalidateProjectPaths(projectId, project?.client_id);

    return { success: true };
  } catch (error) {
    return { error: getErrorMessage(error), success: false };
  }
}

export async function saveUploadedFileMetadataAction(input: unknown): Promise<ActionResult> {
  const parsed = fileMetadataSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid file metadata.", success: false };
  }

  try {
    const viewer = await requireViewer();
    const supabase = await createSupabaseServerClient();

    const { data: file, error } = await supabase
      .from("uploaded_files")
      .insert({
        bucket: parsed.data.bucket,
        category: parsed.data.category,
        file_name: parsed.data.fileName,
        mime_type: parsed.data.mimeType || null,
        project_id: parsed.data.projectId,
        size_bytes: parsed.data.sizeBytes,
        storage_path: parsed.data.storagePath,
        uploaded_by: viewer.userId,
        uploader_name: viewer.profile.full_name,
        visibility: parsed.data.visibility
      })
      .select("*")
      .single();

    if (error || !file) {
      throw error ?? new Error("File metadata could not be saved.");
    }

    const { data: project } = await supabase
      .from("projects")
      .select("client_id")
      .eq("id", parsed.data.projectId)
      .single();

    await logActivity({
      action: "file_uploaded",
      actor_name: viewer.profile.full_name,
      actor_user_id: viewer.userId,
      client_id: project?.client_id ?? null,
      entity_id: file.id,
      entity_type: "file",
      message: `Uploaded ${file.file_name}.`,
      project_id: parsed.data.projectId,
      visibility: file.visibility
    });

    revalidateProjectPaths(parsed.data.projectId, project?.client_id);

    return { success: true };
  } catch (error) {
    return { error: getErrorMessage(error), success: false };
  }
}

export async function createProposalAction(
  projectId: string,
  input: unknown
): Promise<ActionResult<{ proposalId: string }>> {
  const parsed = proposalFormSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid proposal details.", success: false };
  }

  try {
    const viewer = await requireAgencyWorkspace();
    const supabase = await createSupabaseServerClient();
    const notificationData = await getProjectNotificationData(projectId);
    if (!["draft", "sent"].includes(parsed.data.status)) {
      return { error: "New proposals can only start as draft or sent.", success: false };
    }
    const pricingTotal = parsed.data.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const isSent = parsed.data.status === "sent";

    const { data: proposal, error } = await supabase
      .from("proposals")
      .insert({
        created_by: viewer.userId,
        deliverables: parsed.data.deliverables,
        notes: parsed.data.notes || null,
        pricing_total: pricingTotal,
        project_id: projectId,
        revision_count: parsed.data.revisionCount,
        scope: parsed.data.scope,
        sent_at: isSent ? new Date().toISOString() : null,
        status: parsed.data.status,
        timeline: parsed.data.timeline,
        title: parsed.data.title
      })
      .select("*")
      .single();

    if (error || !proposal) {
      throw error ?? new Error("Proposal could not be created.");
    }

    const itemPayload = parsed.data.items.map((item, index) => ({
      description: item.description || null,
      label: item.label,
      proposal_id: proposal.id,
      quantity: item.quantity,
      sort_order: index,
      unit_price: item.unitPrice
    }));

    const { error: itemError } = await supabase.from("proposal_items").insert(itemPayload);

    if (itemError) {
      throw itemError;
    }

    await logActivity({
      action: isSent ? "proposal_sent" : "proposal_created",
      actor_name: viewer.profile.full_name,
      actor_user_id: viewer.userId,
      client_id: notificationData?.client?.id ?? null,
      entity_id: proposal.id,
      entity_type: "proposal",
      message: isSent
        ? `Sent proposal ${proposal.title}.`
        : `Drafted proposal ${proposal.title}.`,
      project_id: projectId,
      visibility: isSent ? "client" : "internal"
    });

    if (isSent && notificationData?.client?.email) {
      await sendNotificationEmail({
        html: renderNotificationTemplate({
          ctaHref: buildAppUrl(`/portal/proposals/${proposal.id}`),
          ctaLabel: "Review proposal",
          intro: `A new proposal for ${notificationData.project.name} is ready for review.`,
          title: proposal.title
        }),
        subject: `StudioFlow: proposal ready for ${notificationData.project.name}`,
        to: [notificationData.client.email]
      });
    }

    revalidateProjectPaths(projectId, notificationData?.client?.id);

    return { data: { proposalId: proposal.id }, success: true };
  } catch (error) {
    return { error: getErrorMessage(error), success: false };
  }
}

export async function respondToProposalAction(input: unknown): Promise<ActionResult> {
  const parsed = proposalDecisionSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid proposal response.", success: false };
  }

  try {
    const viewer = await requireClientViewer();
    const supabase = await createSupabaseServerClient();
    const { data: proposalProject } = await supabase
      .from("proposals")
      .select("project_id")
      .eq("id", parsed.data.proposalId)
      .single();

    const notificationData = proposalProject
      ? await getProjectNotificationData(proposalProject.project_id)
      : null;

    const { data: proposal, error } = await supabase.rpc("respond_to_proposal", {
      decision: parsed.data.status,
      response_body: parsed.data.responseBody || null,
      target_proposal_id: parsed.data.proposalId
    });

    if (error || !proposal) {
      throw error ?? new Error("Proposal could not be updated.");
    }

    await logActivity({
      action: proposal.status === "accepted" ? "proposal_accepted" : "proposal_rejected",
      actor_name: viewer.profile.full_name,
      actor_user_id: viewer.userId,
      client_id: viewer.clientMembership.client_id,
      entity_id: proposal.id,
      entity_type: "proposal",
      message:
        proposal.status === "accepted"
          ? `${viewer.profile.full_name} accepted the proposal.`
          : `${viewer.profile.full_name} declined the proposal.`,
      project_id: proposal.project_id,
      visibility: "client"
    });

    if (notificationData?.agencyRecipients.length) {
      await sendNotificationEmail({
        html: renderNotificationTemplate({
          ctaHref: buildAppUrl(`/projects/${proposal.project_id}/proposal`),
          ctaLabel: "Open proposal",
          intro: `${viewer.profile.full_name} responded to the proposal for ${notificationData.project.name}.`,
          title: proposal.status === "accepted" ? "Proposal accepted" : "Proposal rejected"
        }),
        subject: `StudioFlow: ${notificationData.project.name} proposal ${proposal.status}`,
        to: notificationData.agencyRecipients
      });
    }

    revalidateProjectPaths(proposal.project_id, viewer.clientMembership.client_id);
    revalidatePath(`/portal/proposals/${proposal.id}`);

    return { success: true };
  } catch (error) {
    return { error: getErrorMessage(error), success: false };
  }
}

export async function createApprovalRequestAction(
  projectId: string,
  input: unknown
): Promise<ActionResult<{ approvalId: string }>> {
  const parsed = approvalFormSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid approval request.", success: false };
  }

  try {
    const viewer = await requireAgencyWorkspace();
    const supabase = await createSupabaseServerClient();
    const notificationData = await getProjectNotificationData(projectId);
    const { data: deliverable } = await supabase
      .from("uploaded_files")
      .select("id, category")
      .eq("id", parsed.data.deliverableFileId)
      .single();

    if (!deliverable || deliverable.category !== "deliverable") {
      return { error: "Select a deliverable file for approval.", success: false };
    }

    const { data: approval, error } = await supabase
      .from("approval_requests")
      .insert({
        deliverable_file_id: parsed.data.deliverableFileId,
        message: parsed.data.message || null,
        project_id: projectId,
        requested_by: viewer.userId,
        requested_by_name: viewer.profile.full_name,
        title: parsed.data.title
      })
      .select("*")
      .single();

    if (error || !approval) {
      throw error ?? new Error("Approval request could not be created.");
    }

    await logActivity({
      action: "approval_requested",
      actor_name: viewer.profile.full_name,
      actor_user_id: viewer.userId,
      client_id: notificationData?.client?.id ?? null,
      entity_id: approval.id,
      entity_type: "approval_request",
      message: `Requested client approval for ${approval.title}.`,
      project_id: projectId,
      visibility: "client"
    });

    if (notificationData?.client?.email) {
      await sendNotificationEmail({
        html: renderNotificationTemplate({
          ctaHref: buildAppUrl(`/portal/approvals/${approval.id}`),
          ctaLabel: "Review deliverable",
          intro: `A deliverable is ready for review on ${notificationData.project.name}.`,
          title: approval.title
        }),
        subject: `StudioFlow: approval requested for ${notificationData.project.name}`,
        to: [notificationData.client.email]
      });
    }

    revalidateProjectPaths(projectId, notificationData?.client?.id);
    revalidatePath(`/portal/approvals/${approval.id}`);

    return { data: { approvalId: approval.id }, success: true };
  } catch (error) {
    return { error: getErrorMessage(error), success: false };
  }
}

export async function respondToApprovalAction(input: unknown): Promise<ActionResult> {
  const parsed = approvalDecisionWithRevisionSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid approval response.", success: false };
  }

  try {
    const viewer = await requireClientViewer();
    const supabase = await createSupabaseServerClient();
    const { data: approvalProject } = await supabase
      .from("approval_requests")
      .select("project_id, title")
      .eq("id", parsed.data.approvalRequestId)
      .single();

    const notificationData = approvalProject
      ? await getProjectNotificationData(approvalProject.project_id)
      : null;

    const { data: approval, error } = await supabase.rpc("respond_to_approval", {
      decision: parsed.data.status,
      response_body: parsed.data.responseBody || null,
      target_approval_id: parsed.data.approvalRequestId
    });

    if (error || !approval) {
      throw error ?? new Error("Approval request could not be updated.");
    }

    if (parsed.data.status === "changes_requested") {
      const revisionTitle = parsed.data.revisionTitle || `${approval.title} revisions`;
      const revisionDescription =
        parsed.data.revisionDescription ||
        parsed.data.responseBody ||
        "Please review the requested changes noted in the approval feedback.";

      await supabase.from("revision_requests").insert({
        approval_request_id: approval.id,
        description: revisionDescription,
        priority: "medium",
        project_id: approval.project_id,
        status: "open",
        submitted_by: viewer.userId,
        submitted_by_name: viewer.profile.full_name,
        title: revisionTitle
      });
    }

    await logActivity({
      action:
        parsed.data.status === "approved"
          ? "approval_approved"
          : "approval_changes_requested",
      actor_name: viewer.profile.full_name,
      actor_user_id: viewer.userId,
      client_id: viewer.clientMembership.client_id,
      entity_id: approval.id,
      entity_type: "approval_request",
      message:
        parsed.data.status === "approved"
          ? `${viewer.profile.full_name} approved the deliverable.`
          : `${viewer.profile.full_name} requested changes.`,
      project_id: approval.project_id,
      visibility: "client"
    });

    if (notificationData?.agencyRecipients.length) {
      await sendNotificationEmail({
        html: renderNotificationTemplate({
          ctaHref: buildAppUrl(`/projects/${approval.project_id}/approvals`),
          ctaLabel: "View approval",
          intro: `${viewer.profile.full_name} responded to the approval request for ${notificationData.project.name}.`,
          title:
            parsed.data.status === "approved"
              ? "Deliverable approved"
              : "Changes requested"
        }),
        subject: `StudioFlow: ${notificationData.project.name} approval ${parsed.data.status}`,
        to: notificationData.agencyRecipients
      });
    }

    revalidateProjectPaths(approval.project_id, viewer.clientMembership.client_id);
    revalidatePath(`/portal/approvals/${approval.id}`);

    return { success: true };
  } catch (error) {
    return { error: getErrorMessage(error), success: false };
  }
}

export async function createRevisionRequestAction(
  projectId: string,
  input: unknown
): Promise<ActionResult> {
  const parsed = revisionFormSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid revision request.", success: false };
  }

  try {
    const viewer = await requireViewer();
    const supabase = await createSupabaseServerClient();
    const notificationData = await getProjectNotificationData(projectId);
    const nextStatus = viewer.clientMembership ? "open" : parsed.data.status;

    const { error } = await supabase.from("revision_requests").insert({
      approval_request_id: parsed.data.approvalRequestId || null,
      description: parsed.data.description,
      priority: parsed.data.priority,
      project_id: projectId,
      status: nextStatus,
      submitted_by: viewer.userId,
      submitted_by_name: viewer.profile.full_name,
      title: parsed.data.title
    });

    if (error) {
      throw error;
    }

    await logActivity({
      action: "revision_submitted",
      actor_name: viewer.profile.full_name,
      actor_user_id: viewer.userId,
      client_id: notificationData?.client?.id ?? null,
      entity_id: projectId,
      entity_type: "revision_request",
      message: `${viewer.profile.full_name} submitted a revision request.`,
      project_id: projectId,
      visibility: "client"
    });

    if (viewer.clientMembership && notificationData?.agencyRecipients.length) {
      await sendNotificationEmail({
        html: renderNotificationTemplate({
          ctaHref: buildAppUrl(`/projects/${projectId}/revisions`),
          ctaLabel: "Review revision",
          intro: `${viewer.profile.full_name} added a new revision request in ${notificationData.project.name}.`,
          title: parsed.data.title
        }),
        subject: `StudioFlow: new revision request for ${notificationData.project.name}`,
        to: notificationData.agencyRecipients
      });
    }

    revalidateProjectPaths(projectId, notificationData?.client?.id);

    return { success: true };
  } catch (error) {
    return { error: getErrorMessage(error), success: false };
  }
}

export async function updateRevisionStatusAction(
  revisionId: string,
  status: TableRow<"revision_requests">["status"]
): Promise<ActionResult> {
  try {
    const viewer = await requireAgencyWorkspace();
    const supabase = await createSupabaseServerClient();
    const { data: revision, error } = await supabase
      .from("revision_requests")
      .update({
        resolved_at: status === "resolved" ? new Date().toISOString() : null,
        status
      })
      .eq("id", revisionId)
      .select("*")
      .single();

    if (error || !revision) {
      throw error ?? new Error("Revision status could not be updated.");
    }

    await logActivity({
      action: "revision_updated",
      actor_name: viewer.profile.full_name,
      actor_user_id: viewer.userId,
      client_id: null,
      entity_id: revision.id,
      entity_type: "revision_request",
      message: `Revision "${revision.title}" moved to ${status.replace(/_/g, " ")}.`,
      project_id: revision.project_id,
      visibility: "internal"
    });

    revalidateProjectPaths(revision.project_id);

    return { success: true };
  } catch (error) {
    return { error: getErrorMessage(error), success: false };
  }
}

export async function createInvoiceAction(
  projectId: string,
  input: unknown
): Promise<ActionResult> {
  const parsed = invoiceFormSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid invoice details.", success: false };
  }

  try {
    const viewer = await requireAgencyWorkspace();
    const supabase = await createSupabaseServerClient();
    const notificationData = await getProjectNotificationData(projectId);
    const issuedAt =
      parsed.data.status === "sent" || parsed.data.status === "paid" || parsed.data.status === "overdue"
        ? new Date().toISOString()
        : null;
    const paidAt = parsed.data.status === "paid" ? new Date().toISOString() : null;

    const { data: invoice, error } = await supabase
      .from("invoices")
      .insert({
        amount: parsed.data.amount,
        created_by: viewer.userId,
        due_date: parsed.data.dueDate,
        invoice_number: parsed.data.invoiceNumber,
        issued_at: issuedAt,
        note: parsed.data.note || null,
        paid_at: paidAt,
        project_id: projectId,
        status: parsed.data.status
      })
      .select("*")
      .single();

    if (error || !invoice) {
      throw error ?? new Error("Invoice could not be created.");
    }

    await logActivity({
      action: "invoice_created",
      actor_name: viewer.profile.full_name,
      actor_user_id: viewer.userId,
      client_id: notificationData?.client?.id ?? null,
      entity_id: invoice.id,
      entity_type: "invoice",
      message: `Created invoice ${invoice.invoice_number}.`,
      project_id: projectId,
      visibility: parsed.data.status === "draft" ? "internal" : "client"
    });

    if (parsed.data.status !== "draft" && notificationData?.client?.email) {
      await sendNotificationEmail({
        html: renderNotificationTemplate({
          ctaHref: buildAppUrl(`/portal/projects/${projectId}`),
          ctaLabel: "View invoice status",
          intro: `Invoice ${invoice.invoice_number} is now marked ${invoice.status.replace(/_/g, " ")}.`,
          title: `Invoice ${invoice.invoice_number}`
        }),
        subject: `StudioFlow: invoice ${invoice.invoice_number} ${invoice.status}`,
        to: [notificationData.client.email]
      });
    }

    revalidateProjectPaths(projectId, notificationData?.client?.id);

    return { success: true };
  } catch (error) {
    return { error: getErrorMessage(error), success: false };
  }
}

export async function updateInvoiceStatusAction(
  invoiceId: string,
  status: TableRow<"invoices">["status"]
): Promise<ActionResult> {
  try {
    const viewer = await requireAgencyWorkspace();
    const supabase = await createSupabaseServerClient();
    const { data: invoice, error } = await supabase
      .from("invoices")
      .update({
        paid_at: status === "paid" ? new Date().toISOString() : null,
        status
      })
      .eq("id", invoiceId)
      .select("*")
      .single();

    if (error || !invoice) {
      throw error ?? new Error("Invoice status could not be updated.");
    }

    const notificationData = await getProjectNotificationData(invoice.project_id);

    await logActivity({
      action: "invoice_updated",
      actor_name: viewer.profile.full_name,
      actor_user_id: viewer.userId,
      client_id: notificationData?.client?.id ?? null,
      entity_id: invoice.id,
      entity_type: "invoice",
      message: `Invoice ${invoice.invoice_number} is now ${status}.`,
      project_id: invoice.project_id,
      visibility: status === "draft" ? "internal" : "client"
    });

    if (status !== "draft" && notificationData?.client?.email) {
      await sendNotificationEmail({
        html: renderNotificationTemplate({
          ctaHref: buildAppUrl(`/portal/projects/${invoice.project_id}`),
          ctaLabel: "Open portal",
          intro: `Invoice ${invoice.invoice_number} was updated to ${status.replace(/_/g, " ")}.`,
          title: "Invoice status updated"
        }),
        subject: `StudioFlow: invoice ${invoice.invoice_number} updated`,
        to: [notificationData.client.email]
      });
    }

    revalidateProjectPaths(invoice.project_id, notificationData?.client?.id);

    return { success: true };
  } catch (error) {
    return { error: getErrorMessage(error), success: false };
  }
}
