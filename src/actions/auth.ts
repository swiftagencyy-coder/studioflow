"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getViewerHomePath, getViewerContext } from "@/lib/auth/context";
import {
  agencySetupSchema,
  loginWithInviteSchema,
  registerWithInviteSchema
} from "@/lib/validation/schemas";

export type ActionResult<T = void> = {
  data?: T;
  error?: string;
  redirectTo?: string;
  success: boolean;
};

export async function loginAction(
  input: unknown
): Promise<ActionResult<{ message?: string }>> {
  const parsed = loginWithInviteSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid credentials.", success: false };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password
  });

  if (error) {
    return { error: error.message, success: false };
  }

  const viewer = await getViewerContext();

  return {
    redirectTo: parsed.data.inviteToken
      ? `/invite/${parsed.data.inviteToken}`
      : viewer
        ? getViewerHomePath(viewer)
        : "/dashboard",
    success: true
  };
}

export async function registerAction(
  input: unknown
): Promise<ActionResult<{ message?: string }>> {
  const parsed = registerWithInviteSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid sign up details.", success: false };
  }

  let defaultRole: "agency_owner" | "team_member" | "client" = "agency_owner";

  if (parsed.data.inviteToken) {
    const admin = createSupabaseAdminClient();
    const { data: invitation } = await admin
      .from("workspace_invitations")
      .select("email, invited_role, status")
      .eq("token", parsed.data.inviteToken)
      .maybeSingle();

    if (!invitation || invitation.status !== "pending") {
      return { error: "This invitation is no longer available.", success: false };
    }

    if (invitation.email.toLowerCase() !== parsed.data.email.toLowerCase()) {
      return {
        error: "Use the same email address that received the invitation.",
        success: false
      };
    }

    defaultRole = invitation.invited_role === "team_member" ? "team_member" : "client";
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        default_role: defaultRole,
        full_name: parsed.data.fullName
      }
    }
  });

  if (error) {
    return { error: error.message, success: false };
  }

  return {
    data: data.session
      ? undefined
      : {
          message:
            "Check your inbox to confirm your account, then continue into StudioFlow."
        },
    redirectTo: data.session
      ? parsed.data.inviteToken
        ? `/invite/${parsed.data.inviteToken}`
        : "/setup"
      : parsed.data.inviteToken
        ? `/login?invite=${parsed.data.inviteToken}`
        : "/login",
    success: true
  };
}

export async function setupAgencyAction(
  input: unknown
): Promise<ActionResult> {
  const parsed = agencySetupSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter your agency name.", success: false };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("bootstrap_agency_owner", {
    input_agency_name: parsed.data.agencyName
  });

  if (error) {
    return { error: error.message, success: false };
  }

  return { redirectTo: "/dashboard", success: true };
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}
