import "dotenv/config";

import { Buffer } from "node:buffer";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Database } from "../src/types/database";

const env = z
  .object({
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1)
  })
  .parse(process.env);

const supabase = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const DEMO_PASSWORD = "StudioFlow123!";

const ids = {
  activity01: "11111111-1111-4111-8111-111111111111",
  activity02: "11111111-1111-4111-8111-111111111112",
  activity03: "11111111-1111-4111-8111-111111111113",
  activity04: "11111111-1111-4111-8111-111111111114",
  activity05: "11111111-1111-4111-8111-111111111115",
  activity06: "11111111-1111-4111-8111-111111111116",
  agency: "20000000-0000-4000-8000-000000000001",
  approval01: "70000000-0000-4000-8000-000000000001",
  approval02: "70000000-0000-4000-8000-000000000002",
  client01: "30000000-0000-4000-8000-000000000001",
  client02: "30000000-0000-4000-8000-000000000002",
  file01: "50000000-0000-4000-8000-000000000001",
  file02: "50000000-0000-4000-8000-000000000002",
  file03: "50000000-0000-4000-8000-000000000003",
  file04: "50000000-0000-4000-8000-000000000004",
  file05: "50000000-0000-4000-8000-000000000005",
  invoice01: "90000000-0000-4000-8000-000000000001",
  invoice02: "90000000-0000-4000-8000-000000000002",
  invoice03: "90000000-0000-4000-8000-000000000003",
  onboarding01: "40000000-0000-4000-8000-000000000001",
  onboarding02: "40000000-0000-4000-8000-000000000002",
  project01: "40000000-0000-4000-8000-000000000101",
  project02: "40000000-0000-4000-8000-000000000102",
  project03: "40000000-0000-4000-8000-000000000103",
  proposal01: "60000000-0000-4000-8000-000000000001",
  proposal02: "60000000-0000-4000-8000-000000000002",
  proposal03: "60000000-0000-4000-8000-000000000003",
  proposalItem01: "61000000-0000-4000-8000-000000000001",
  proposalItem02: "61000000-0000-4000-8000-000000000002",
  proposalItem03: "61000000-0000-4000-8000-000000000003",
  proposalItem04: "61000000-0000-4000-8000-000000000004",
  proposalItem05: "61000000-0000-4000-8000-000000000005",
  revision01: "80000000-0000-4000-8000-000000000001",
  revision02: "80000000-0000-4000-8000-000000000002"
} as const;

type DemoUser = {
  defaultRole: Database["public"]["Tables"]["profiles"]["Row"]["default_role"];
  email: string;
  fullName: string;
};

async function ensureUser(user: DemoUser) {
  const { data: userList } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200
  });
  const existing = userList.users.find((entry) => entry.email === user.email);

  if (existing) {
    await supabase.auth.admin.updateUserById(existing.id, {
      email: user.email,
      password: DEMO_PASSWORD,
      user_metadata: {
        default_role: user.defaultRole,
        full_name: user.fullName
      }
    });

    await supabase.from("profiles").upsert({
      default_role: user.defaultRole,
      email: user.email,
      full_name: user.fullName,
      id: existing.id
    });

    return existing.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: user.email,
    email_confirm: true,
    password: DEMO_PASSWORD,
    user_metadata: {
      default_role: user.defaultRole,
      full_name: user.fullName
    }
  });

  if (error || !data.user) {
    throw error ?? new Error(`Unable to create ${user.email}`);
  }

  await supabase.from("profiles").upsert({
    default_role: user.defaultRole,
    email: user.email,
    full_name: user.fullName,
    id: data.user.id
  });

  return data.user.id;
}

async function uploadTextObject(bucket: string, path: string, content: string, contentType: string) {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, Buffer.from(content), {
      contentType,
      upsert: true
    });

  if (error) {
    throw error;
  }
}

async function main() {
  const ownerId = await ensureUser({
    defaultRole: "agency_owner",
    email: "owner@studioflow.demo",
    fullName: "Aria North"
  });
  const teamId = await ensureUser({
    defaultRole: "team_member",
    email: "team@studioflow.demo",
    fullName: "Miles Reed"
  });
  const clientUserOneId = await ensureUser({
    defaultRole: "client",
    email: "maya@lumencoffee.demo",
    fullName: "Maya Bennett"
  });
  const clientUserTwoId = await ensureUser({
    defaultRole: "client",
    email: "nina@atelier.demo",
    fullName: "Nina Alvarez"
  });

  await supabase.from("agencies").upsert({
    id: ids.agency,
    name: "Northline Studio",
    owner_user_id: ownerId,
    slug: "northline-studio"
  });

  await supabase.from("agency_members").upsert([
    {
      agency_id: ids.agency,
      role: "agency_owner",
      title: "Founder",
      user_id: ownerId
    },
    {
      agency_id: ids.agency,
      role: "team_member",
      title: "Creative producer",
      user_id: teamId
    }
  ]);

  await supabase.from("clients").upsert([
    {
      agency_id: ids.agency,
      contact_name: "Maya Bennett",
      created_by: ownerId,
      email: "maya@lumencoffee.demo",
      id: ids.client01,
      name: "Lumen Coffee",
      phone: "+1 415 555 0142",
      status: "active",
      tags: ["branding", "website", "priority"]
    },
    {
      agency_id: ids.agency,
      contact_name: "Nina Alvarez",
      created_by: ownerId,
      email: "nina@atelier.demo",
      id: ids.client02,
      name: "Atelier Skin",
      phone: "+1 646 555 0118",
      status: "active",
      tags: ["launch", "campaign"]
    }
  ]);

  await supabase.from("client_private_details").upsert([
    {
      client_id: ids.client01,
      notes: "High-velocity founder. Prefers tight weekly checkpoints and direct feedback."
    },
    {
      client_id: ids.client02,
      notes: "Needs polished client-facing updates. Legal review can slow approvals."
    }
  ]);

  await supabase.from("client_users").upsert([
    {
      client_id: ids.client01,
      is_primary: true,
      title: "Founder",
      user_id: clientUserOneId
    },
    {
      client_id: ids.client02,
      is_primary: true,
      title: "Marketing lead",
      user_id: clientUserTwoId
    }
  ]);

  await supabase.from("projects").upsert([
    {
      agency_id: ids.agency,
      client_id: ids.client01,
      created_by: ownerId,
      description: "A brand refresh and Webflow landing page for a multi-location cafe launch.",
      due_date: "2026-04-02",
      id: ids.project01,
      name: "Brand & Site Refresh",
      onboarding_completed_at: "2026-03-02T10:00:00Z",
      onboarding_requested_at: "2026-02-28T10:00:00Z",
      portal_summary: "Refreshing the Lumen Coffee identity and launch site.",
      service_type: "Website design",
      status: "review"
    },
    {
      agency_id: ids.agency,
      client_id: ids.client01,
      created_by: teamId,
      description: "A retention-focused subscriptions landing page and experimentation backlog.",
      due_date: "2026-04-18",
      id: ids.project02,
      name: "Subscriptions Landing Page",
      onboarding_requested_at: "2026-03-08T09:00:00Z",
      portal_summary: "Clarifying the subscription offer before the next campaign push.",
      service_type: "Landing page",
      status: "onboarding"
    },
    {
      agency_id: ids.agency,
      client_id: ids.client02,
      created_by: ownerId,
      description: "Launch creative system for a new skincare line including paid social and email art direction.",
      due_date: "2026-03-27",
      id: ids.project03,
      name: "Spring Campaign Kit",
      onboarding_completed_at: "2026-03-01T11:30:00Z",
      onboarding_requested_at: "2026-02-26T15:00:00Z",
      portal_summary: "Creative package for launch-week ads, email, and landing page visuals.",
      service_type: "Marketing creative",
      status: "in_progress"
    }
  ]);

  await supabase.from("project_private_details").upsert([
    {
      internal_notes: "Prep alternate hero messaging if the menu restructure slips.",
      project_id: ids.project01
    },
    {
      internal_notes: "Waiting on cafe KPI baseline before finalizing CRO hypotheses.",
      project_id: ids.project02
    },
    {
      internal_notes: "Need one more packaging render to support the ad concept deck.",
      project_id: ids.project03
    }
  ]);

  await supabase.from("onboarding_submissions").upsert([
    {
      brand_colors: ["forest green", "warm cream", "espresso"],
      business_description: "Independent cafe brand expanding from wholesale into neighborhood retail.",
      competitor_examples: ["Blue Bottle", "Verve Coffee"],
      deadlines: "Need first concepts before the April opening",
      design_style_preferences: "Warm, editorial, tactile, understated.",
      extra_notes: "Need packaging mockups that work for social teasers.",
      font_preferences: "Contemporary serif paired with clean sans.",
      id: ids.onboarding01,
      project_id: ids.project01,
      required_pages: "Homepage, menu teaser, about, locations, subscriptions CTA.",
      submitted_by: clientUserOneId,
      target_audience: "Urban professionals who care about quality and routine."
    },
    {
      brand_colors: ["soft sand", "charcoal", "sage accent"],
      business_description: "Direct-to-consumer skincare brand entering paid social for the first time.",
      competitor_examples: ["Aesop", "Typology"],
      deadlines: "Need launch creative approved before end of month.",
      design_style_preferences: "Minimal, premium, close-up product texture moments.",
      extra_notes: "Please keep claims language conservative for compliance review.",
      font_preferences: "Elegant sans with fashion editorial rhythm.",
      id: ids.onboarding02,
      project_id: ids.project03,
      required_pages: "Paid social sets, email launch, launch page hero system.",
      submitted_by: clientUserTwoId,
      target_audience: "Skincare-savvy customers shopping for elevated but accessible routines."
    }
  ]);

  const filePaths = {
    file01: `${ids.agency}/${ids.project01}/${ids.client01}/client/project-assets-lumen-logo.txt`,
    file02: `${ids.agency}/${ids.project01}/${ids.client01}/client/onboarding-files-brand-brief.txt`,
    file03: `${ids.agency}/${ids.project01}/${ids.client01}/client/deliverables-homepage-v1.txt`,
    file04: `${ids.agency}/${ids.project02}/${ids.client01}/internal/project-assets-cro-notes.txt`,
    file05: `${ids.agency}/${ids.project03}/${ids.client02}/client/deliverables-campaign-concepts.txt`
  };

  await uploadTextObject(
    "project-assets",
    filePaths.file01,
    "Lumen Coffee primary logo reference uploaded for the brand refresh.",
    "text/plain"
  );
  await uploadTextObject(
    "onboarding-files",
    filePaths.file02,
    "Brand brief reference notes and cafe launch goals.",
    "text/plain"
  );
  await uploadTextObject(
    "deliverables",
    filePaths.file03,
    "Homepage concept v1 for Lumen Coffee review.",
    "text/plain"
  );
  await uploadTextObject(
    "project-assets",
    filePaths.file04,
    "Internal CRO notes for subscriptions landing page hypotheses.",
    "text/plain"
  );
  await uploadTextObject(
    "deliverables",
    filePaths.file05,
    "Campaign concept direction set for Atelier Skin launch review.",
    "text/plain"
  );

  await supabase.from("uploaded_files").upsert([
    {
      bucket: "project-assets",
      category: "logo",
      file_name: "lumen-primary-logo.txt",
      id: ids.file01,
      mime_type: "text/plain",
      project_id: ids.project01,
      size_bytes: 58,
      storage_path: filePaths.file01,
      uploaded_by: clientUserOneId,
      uploader_name: "Maya Bennett",
      visibility: "client"
    },
    {
      bucket: "onboarding-files",
      category: "onboarding_asset",
      file_name: "lumen-brand-brief.txt",
      id: ids.file02,
      mime_type: "text/plain",
      project_id: ids.project01,
      size_bytes: 45,
      storage_path: filePaths.file02,
      uploaded_by: clientUserOneId,
      uploader_name: "Maya Bennett",
      visibility: "client"
    },
    {
      bucket: "deliverables",
      category: "deliverable",
      file_name: "homepage-concept-v1.txt",
      id: ids.file03,
      mime_type: "text/plain",
      project_id: ids.project01,
      size_bytes: 39,
      storage_path: filePaths.file03,
      uploaded_by: teamId,
      uploader_name: "Miles Reed",
      visibility: "client"
    },
    {
      bucket: "project-assets",
      category: "document",
      file_name: "subscriptions-cro-notes.txt",
      id: ids.file04,
      mime_type: "text/plain",
      project_id: ids.project02,
      size_bytes: 62,
      storage_path: filePaths.file04,
      uploaded_by: teamId,
      uploader_name: "Miles Reed",
      visibility: "internal"
    },
    {
      bucket: "deliverables",
      category: "deliverable",
      file_name: "campaign-concepts.txt",
      id: ids.file05,
      mime_type: "text/plain",
      project_id: ids.project03,
      size_bytes: 55,
      storage_path: filePaths.file05,
      uploaded_by: ownerId,
      uploader_name: "Aria North",
      visibility: "client"
    }
  ]);

  await supabase.from("proposals").upsert([
    {
      created_by: ownerId,
      deliverables: "Identity direction, homepage design, launch assets",
      id: ids.proposal01,
      notes: "Includes two rounds of revisions and handoff files.",
      pricing_total: 8600,
      project_id: ids.project01,
      responded_at: "2026-03-04T09:30:00Z",
      response_message: "Approved. Please proceed with concept refinement.",
      revision_count: 2,
      scope: "Brand refresh and launch site for Lumen Coffee.",
      sent_at: "2026-03-02T12:00:00Z",
      status: "accepted",
      timeline: "3 weeks",
      title: "Lumen launch proposal"
    },
    {
      created_by: teamId,
      deliverables: "Landing page copy framework, wireframes, final design",
      id: ids.proposal02,
      notes: "Best if paired with analytics access before final copy.",
      pricing_total: 3200,
      project_id: ids.project02,
      revision_count: 1,
      scope: "Subscriptions landing page with CRO-informed structure.",
      sent_at: "2026-03-09T08:15:00Z",
      status: "sent",
      timeline: "10 business days",
      title: "Subscriptions page proposal"
    },
    {
      created_by: ownerId,
      deliverables: "Creative direction, ad concepts, email launch assets",
      id: ids.proposal03,
      notes: "Drafting a larger retainer follow-up after launch week.",
      pricing_total: 5400,
      project_id: ids.project03,
      revision_count: 2,
      scope: "Campaign creative package for the spring launch.",
      status: "draft",
      timeline: "2 weeks",
      title: "Spring campaign package"
    }
  ]);

  await supabase.from("proposal_items").upsert([
    {
      description: "Identity options and refinement",
      id: ids.proposalItem01,
      label: "Brand direction",
      proposal_id: ids.proposal01,
      quantity: 1,
      sort_order: 0,
      unit_price: 3200
    },
    {
      description: "Homepage and key supporting screens",
      id: ids.proposalItem02,
      label: "Launch site design",
      proposal_id: ids.proposal01,
      quantity: 1,
      sort_order: 1,
      unit_price: 5400
    },
    {
      description: "Offer framing and UX outline",
      id: ids.proposalItem03,
      label: "Page strategy",
      proposal_id: ids.proposal02,
      quantity: 1,
      sort_order: 0,
      unit_price: 1200
    },
    {
      description: "Responsive final screens",
      id: ids.proposalItem04,
      label: "Final design",
      proposal_id: ids.proposal02,
      quantity: 1,
      sort_order: 1,
      unit_price: 2000
    },
    {
      description: "Paid social and email suite",
      id: ids.proposalItem05,
      label: "Campaign kit",
      proposal_id: ids.proposal03,
      quantity: 1,
      sort_order: 0,
      unit_price: 5400
    }
  ]);

  await supabase.from("approval_requests").upsert([
    {
      deliverable_file_id: ids.file03,
      id: ids.approval01,
      message: "Please review the homepage concept and highlight any menu or product story changes.",
      project_id: ids.project01,
      requested_at: "2026-03-06T13:00:00Z",
      requested_by: teamId,
      requested_by_name: "Miles Reed",
      responded_at: "2026-03-07T11:30:00Z",
      response_message: "Approved with a small note on the location card ordering.",
      status: "approved",
      title: "Homepage concept review"
    },
    {
      deliverable_file_id: ids.file05,
      id: ids.approval02,
      message: "Looking for direction approval before we expand the asset system.",
      project_id: ids.project03,
      requested_at: "2026-03-10T09:30:00Z",
      requested_by: ownerId,
      requested_by_name: "Aria North",
      status: "pending",
      title: "Campaign concept direction"
    }
  ]);

  await supabase.from("revision_requests").upsert([
    {
      approval_request_id: ids.approval02,
      description: "Please soften the product claim language and show one concept with more negative space.",
      id: ids.revision01,
      priority: "high",
      project_id: ids.project03,
      status: "open",
      submitted_by: clientUserTwoId,
      submitted_by_name: "Nina Alvarez",
      title: "Concept refinement request"
    },
    {
      description: "Swap the subscription hero CTA hierarchy and shorten the testimonial stack.",
      id: ids.revision02,
      priority: "medium",
      project_id: ids.project02,
      status: "in_review",
      submitted_by: teamId,
      submitted_by_name: "Miles Reed",
      title: "Hero hierarchy cleanup"
    }
  ]);

  await supabase.from("invoices").upsert([
    {
      amount: 4300,
      created_by: ownerId,
      due_date: "2026-03-12",
      id: ids.invoice01,
      invoice_number: "NS-1001",
      issued_at: "2026-03-05T10:00:00Z",
      note: "Initial deposit for brand and site refresh.",
      paid_at: "2026-03-08T14:20:00Z",
      project_id: ids.project01,
      status: "paid"
    },
    {
      amount: 3200,
      created_by: teamId,
      due_date: "2026-03-20",
      id: ids.invoice02,
      invoice_number: "NS-1002",
      issued_at: "2026-03-09T08:30:00Z",
      note: "Subscriptions landing page design fee.",
      project_id: ids.project02,
      status: "sent"
    },
    {
      amount: 2700,
      created_by: ownerId,
      due_date: "2026-03-11",
      id: ids.invoice03,
      invoice_number: "NS-1003",
      issued_at: "2026-03-04T16:00:00Z",
      note: "First half of the spring campaign creative package.",
      project_id: ids.project03,
      status: "overdue"
    }
  ]);

  await supabase.from("activity_logs").upsert([
    {
      action: "client_created",
      actor_name: "Aria North",
      actor_user_id: ownerId,
      client_id: ids.client01,
      entity_id: ids.client01,
      entity_type: "client",
      id: ids.activity01,
      message: "Added Lumen Coffee to the workspace.",
      visibility: "internal"
    },
    {
      action: "project_created",
      actor_name: "Aria North",
      actor_user_id: ownerId,
      client_id: ids.client01,
      entity_id: ids.project01,
      entity_type: "project",
      id: ids.activity02,
      message: "Created Brand & Site Refresh.",
      project_id: ids.project01,
      visibility: "internal"
    },
    {
      action: "onboarding_submitted",
      actor_name: "Maya Bennett",
      actor_user_id: clientUserOneId,
      client_id: ids.client01,
      entity_id: ids.project01,
      entity_type: "project",
      id: ids.activity03,
      message: "Maya Bennett submitted onboarding details.",
      project_id: ids.project01,
      visibility: "client"
    },
    {
      action: "proposal_accepted",
      actor_name: "Maya Bennett",
      actor_user_id: clientUserOneId,
      client_id: ids.client01,
      entity_id: ids.proposal01,
      entity_type: "proposal",
      id: ids.activity04,
      message: "Maya Bennett accepted the launch proposal.",
      project_id: ids.project01,
      visibility: "client"
    },
    {
      action: "approval_requested",
      actor_name: "Aria North",
      actor_user_id: ownerId,
      client_id: ids.client02,
      entity_id: ids.approval02,
      entity_type: "approval_request",
      id: ids.activity05,
      message: "Requested approval on the campaign concept direction.",
      project_id: ids.project03,
      visibility: "client"
    },
    {
      action: "revision_submitted",
      actor_name: "Nina Alvarez",
      actor_user_id: clientUserTwoId,
      client_id: ids.client02,
      entity_id: ids.revision01,
      entity_type: "revision_request",
      id: ids.activity06,
      message: "Nina Alvarez submitted a revision request.",
      project_id: ids.project03,
      visibility: "client"
    }
  ]);

  console.log("StudioFlow demo seed complete.");
  console.log("Owner: owner@studioflow.demo / StudioFlow123!");
  console.log("Team: team@studioflow.demo / StudioFlow123!");
  console.log("Client 1: maya@lumencoffee.demo / StudioFlow123!");
  console.log("Client 2: nina@atelier.demo / StudioFlow123!");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
