import { unstable_noStore as noStore } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TableRow } from "@/types/database";

type ProjectWithClient = TableRow<"projects"> & {
  client: TableRow<"clients"> | null;
};

type AgencyMemberWithAgency = TableRow<"agency_members"> & {
  agency: TableRow<"agencies"> | null;
};

type ClientUserWithClient = TableRow<"client_users"> & {
  client: TableRow<"clients"> | null;
};

export type FileRecordWithUrl = TableRow<"uploaded_files"> & {
  signedUrl: string | null;
};

export async function getAgencyDashboardData(agencyMembership: AgencyMemberWithAgency) {
  noStore();
  const supabase = await createSupabaseServerClient();

  const [
    { count: activeClients },
    { count: activeProjects },
    { count: pendingApprovals },
    { count: unpaidInvoices },
    { data: recentActivity }
  ] = await Promise.all([
    supabase.from("clients").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .neq("status", "completed"),
    supabase.from("approval_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("invoices").select("*", { count: "exact", head: true }).in("status", ["draft", "sent", "overdue"]),
    supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8)
  ]);

  return {
    activeClients: activeClients ?? 0,
    activeProjects: activeProjects ?? 0,
    agency: agencyMembership.agency,
    pendingApprovals: pendingApprovals ?? 0,
    recentActivity: recentActivity ?? [],
    unpaidInvoices: unpaidInvoices ?? 0
  };
}

export async function getAgencyClients(agencyId: string) {
  noStore();
  const supabase = await createSupabaseServerClient();
  const [{ data: clients }, { data: projects }] = await Promise.all([
    supabase.from("clients").select("*").eq("agency_id", agencyId).order("created_at", { ascending: false }),
    supabase.from("projects").select("id, client_id, status").eq("agency_id", agencyId)
  ]);

  const projectCountByClient = new Map<string, number>();
  const activeProjectCountByClient = new Map<string, number>();

  for (const project of projects ?? []) {
    projectCountByClient.set(project.client_id, (projectCountByClient.get(project.client_id) ?? 0) + 1);

    if (project.status !== "completed") {
      activeProjectCountByClient.set(
        project.client_id,
        (activeProjectCountByClient.get(project.client_id) ?? 0) + 1
      );
    }
  }

  return (clients ?? []).map((client) => ({
    ...client,
    activeProjectCount: activeProjectCountByClient.get(client.id) ?? 0,
    projectCount: projectCountByClient.get(client.id) ?? 0
  }));
}

export async function getAgencyProjects(agencyId: string) {
  noStore();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("projects")
    .select("*, client:clients(*)")
    .eq("agency_id", agencyId)
    .order("created_at", { ascending: false });

  return (data as ProjectWithClient[] | null) ?? [];
}

export async function getClientDetail(clientId: string) {
  noStore();
  const supabase = await createSupabaseServerClient();
  const [{ data: client }, { data: privateDetails }, { data: projects }, { data: activity }] =
    await Promise.all([
      supabase.from("clients").select("*").eq("id", clientId).single(),
      supabase.from("client_private_details").select("*").eq("client_id", clientId).maybeSingle(),
      supabase
        .from("projects")
        .select("*, client:clients(*)")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false }),
      supabase
        .from("activity_logs")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
        .limit(10)
    ]);

  const projectIds = (projects ?? []).map((project) => project.id);
  const [
    files,
    proposals,
    approvals,
    revisions,
    invoices
  ] = await Promise.all([
    projectIds.length
      ? supabase.from("uploaded_files").select("*").in("project_id", projectIds).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as TableRow<"uploaded_files">[] }),
    projectIds.length
      ? supabase.from("proposals").select("*").in("project_id", projectIds).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as TableRow<"proposals">[] }),
    projectIds.length
      ? supabase.from("approval_requests").select("*").in("project_id", projectIds).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as TableRow<"approval_requests">[] }),
    projectIds.length
      ? supabase.from("revision_requests").select("*").in("project_id", projectIds).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as TableRow<"revision_requests">[] }),
    projectIds.length
      ? supabase.from("invoices").select("*").in("project_id", projectIds).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as TableRow<"invoices">[] })
  ]);

  return {
    activity: activity ?? [],
    approvals: approvals.data ?? [],
    client,
    files: await attachSignedUrls(files.data ?? []),
    invoices: invoices.data ?? [],
    privateDetails,
    projects: (projects as ProjectWithClient[] | null) ?? [],
    proposals: proposals.data ?? [],
    revisions: revisions.data ?? []
  };
}

export async function getProjectDetail(projectId: string) {
  noStore();
  const supabase = await createSupabaseServerClient();
  const [
    { data: project },
    { data: privateDetails },
    { data: onboarding },
    { data: files },
    { data: proposals },
    { data: approvals },
    { data: revisions },
    { data: invoices },
    { data: activity }
  ] = await Promise.all([
    supabase.from("projects").select("*, client:clients(*)").eq("id", projectId).single(),
    supabase.from("project_private_details").select("*").eq("project_id", projectId).maybeSingle(),
    supabase.from("onboarding_submissions").select("*").eq("project_id", projectId).maybeSingle(),
    supabase.from("uploaded_files").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
    supabase.from("proposals").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
    supabase.from("approval_requests").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
    supabase.from("revision_requests").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
    supabase.from("invoices").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
    supabase.from("activity_logs").select("*").eq("project_id", projectId).order("created_at", { ascending: false }).limit(12)
  ]);

  const proposalIds = (proposals ?? []).map((proposal) => proposal.id);
  const { data: proposalItems } = proposalIds.length
    ? await supabase
        .from("proposal_items")
        .select("*")
        .in("proposal_id", proposalIds)
        .order("sort_order", { ascending: true })
    : { data: [] as TableRow<"proposal_items">[] };

  const itemsByProposal = new Map<string, TableRow<"proposal_items">[]>();

  for (const item of proposalItems ?? []) {
    const current = itemsByProposal.get(item.proposal_id) ?? [];
    current.push(item);
    itemsByProposal.set(item.proposal_id, current);
  }

  return {
    activity: activity ?? [],
    approvals: approvals ?? [],
    files: await attachSignedUrls(files ?? []),
    invoices: invoices ?? [],
    onboarding,
    privateDetails,
    project: project as ProjectWithClient | null,
    proposals: (proposals ?? []).map((proposal) => ({
      ...proposal,
      items: itemsByProposal.get(proposal.id) ?? []
    })),
    revisions: revisions ?? []
  };
}

export async function getPortalOverview(clientMembership: ClientUserWithClient) {
  noStore();
  const supabase = await createSupabaseServerClient();
  const clientId = clientMembership.client_id;

  const [{ data: projects }, { data: activity }] = await Promise.all([
    supabase
      .from("projects")
      .select("*, client:clients(*)")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false }),
    supabase
      .from("activity_logs")
      .select("*")
      .eq("client_id", clientId)
      .eq("visibility", "client")
      .order("created_at", { ascending: false })
      .limit(8)
  ]);

  const projectIds = (projects ?? []).map((project) => project.id);

  const [files, proposals, approvals, revisions, invoices] = await Promise.all([
    projectIds.length
      ? supabase
          .from("uploaded_files")
          .select("*")
          .in("project_id", projectIds)
          .eq("visibility", "client")
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as TableRow<"uploaded_files">[] }),
    projectIds.length
      ? supabase
          .from("proposals")
          .select("*")
          .in("project_id", projectIds)
          .neq("status", "draft")
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as TableRow<"proposals">[] }),
    projectIds.length
      ? supabase.from("approval_requests").select("*").in("project_id", projectIds).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as TableRow<"approval_requests">[] }),
    projectIds.length
      ? supabase.from("revision_requests").select("*").in("project_id", projectIds).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as TableRow<"revision_requests">[] }),
    projectIds.length
      ? supabase.from("invoices").select("*").in("project_id", projectIds).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as TableRow<"invoices">[] })
  ]);

  return {
    activity: activity ?? [],
    approvals: approvals.data ?? [],
    client: clientMembership.client,
    files: await attachSignedUrls(files.data ?? []),
    invoices: invoices.data ?? [],
    projects: (projects as ProjectWithClient[] | null) ?? [],
    proposals: proposals.data ?? [],
    revisions: revisions.data ?? []
  };
}

export async function getPortalProjectDetail(projectId: string) {
  noStore();
  const detail = await getProjectDetail(projectId);

  return {
    ...detail,
    activity: detail.activity.filter((entry) => entry.visibility === "client"),
    files: detail.files.filter((file) => file.visibility === "client"),
    proposals: detail.proposals.filter((proposal) => proposal.status !== "draft")
  };
}

export async function getPortalProposal(proposalId: string) {
  noStore();
  const supabase = await createSupabaseServerClient();
  const { data: proposal } = await supabase.from("proposals").select("*").eq("id", proposalId).single();
  const { data: items } = await supabase
    .from("proposal_items")
    .select("*")
    .eq("proposal_id", proposalId)
    .order("sort_order", { ascending: true });

  return {
    items: items ?? [],
    proposal
  };
}

export async function getPortalApproval(approvalId: string) {
  noStore();
  const supabase = await createSupabaseServerClient();
  const { data: approval } = await supabase.from("approval_requests").select("*").eq("id", approvalId).single();

  let file: FileRecordWithUrl | null = null;

  if (approval?.deliverable_file_id) {
    const { data: deliverable } = await supabase
      .from("uploaded_files")
      .select("*")
      .eq("id", approval.deliverable_file_id)
      .maybeSingle();

    if (deliverable) {
      file = (await attachSignedUrls([deliverable]))[0] ?? null;
    }
  }

  return { approval, file };
}

async function attachSignedUrls(files: TableRow<"uploaded_files">[]) {
  if (!files.length) {
    return [] as FileRecordWithUrl[];
  }

  const supabase = await createSupabaseServerClient();

  return Promise.all(
    files.map(async (file) => {
      const { data } = await supabase.storage.from(file.bucket).createSignedUrl(file.storage_path, 60 * 60);

      return {
        ...file,
        signedUrl: data?.signedUrl ?? null
      };
    })
  );
}
