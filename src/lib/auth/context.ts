import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TableRow } from "@/types/database";

type AgencyMembership = TableRow<"agency_members"> & {
  agency: TableRow<"agencies"> | null;
};

type ClientMembership = TableRow<"client_users"> & {
  client: TableRow<"clients"> | null;
};

export type ViewerContext = {
  agencyMembership: AgencyMembership | null;
  clientMembership: ClientMembership | null;
  profile: TableRow<"profiles">;
  role: "agency_owner" | "team_member" | "client";
  userId: string;
};

export type AgencyViewer = ViewerContext & {
  agencyMembership: AgencyMembership;
  clientMembership: null;
};

export type ClientViewer = ViewerContext & {
  clientMembership: ClientMembership;
};

export async function getViewerContext(): Promise<ViewerContext | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId) {
    return null;
  }

  const [{ data: profile }, { data: agencyMembership }, { data: clientMembership }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase
        .from("agency_members")
        .select("*, agency:agencies(*)")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("client_users")
        .select("*, client:clients(*)")
        .eq("user_id", userId)
        .maybeSingle()
    ]);

  if (!profile) {
    return null;
  }

  const role = agencyMembership?.role
    ? (agencyMembership.role as ViewerContext["role"])
    : clientMembership
      ? "client"
      : profile.default_role;

  return {
    agencyMembership: (agencyMembership as AgencyMembership | null) ?? null,
    clientMembership: (clientMembership as ClientMembership | null) ?? null,
    profile,
    role,
    userId
  };
}

export async function requireViewer() {
  const viewer = await getViewerContext();

  if (!viewer) {
    redirect("/login");
  }

  return viewer;
}

export async function requireAgencyViewer() {
  const viewer = await requireViewer();

  if (viewer.clientMembership) {
    redirect("/portal");
  }

  if (!viewer.agencyMembership) {
    redirect("/setup");
  }

  return viewer as AgencyViewer;
}

export async function requireAgencyWorkspace() {
  return requireAgencyViewer();
}

export async function requireClientViewer() {
  const viewer = await requireViewer();

  if (!viewer.clientMembership) {
    redirect(viewer.agencyMembership ? "/dashboard" : "/setup");
  }

  return viewer as ClientViewer;
}

export function getViewerHomePath(viewer: ViewerContext) {
  if (viewer.clientMembership) {
    return "/portal";
  }

  if (!viewer.agencyMembership) {
    return "/setup";
  }

  return "/dashboard";
}
