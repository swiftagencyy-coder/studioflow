"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getViewerHomePath, getViewerContext } from "@/lib/auth/context";
import {
  agencySetupSchema,
  loginSchema,
  registerSchema
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
  const parsed = loginSchema.safeParse(input);

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
    redirectTo: viewer ? getViewerHomePath(viewer) : "/dashboard",
    success: true
  };
}

export async function registerAction(
  input: unknown
): Promise<ActionResult<{ message?: string }>> {
  const parsed = registerSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid sign up details.", success: false };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        default_role: "agency_owner",
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
    redirectTo: data.session ? "/setup" : "/login",
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
