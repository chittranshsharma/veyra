"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email/resend";
import { checkRateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

const loginActionSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  turnstileToken: z.string().optional(),
});

const signupActionSchema = z.object({
  username: z
    .string()
    .min(3, "At least 3 characters")
    .max(30, "Max 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, and underscores only"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "At least 8 characters"),
  turnstileToken: z.string().optional(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  turnstileToken: z.string().optional(),
});

const updatePasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function loginAction(input: z.infer<typeof loginActionSchema>) {
  const parsed = loginActionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input",
    };
  }

  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "unknown-ip";

  // Rate limit auth attempts (5 requests / 60s per IP)
  const rateLimit = await checkRateLimit(ip, "auth");
  if (!rateLimit.success) {
    return {
      success: false,
      error: "Too many login attempts. Please wait a minute before trying again.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return { success: true };
}

export async function signupAction(
  input: z.infer<typeof signupActionSchema> & { origin: string }
) {
  const parsed = signupActionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input",
    };
  }

  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "unknown-ip";

  // Rate limit auth attempts (5 requests / 60s per IP)
  const rateLimit = await checkRateLimit(ip, "auth");
  if (!rateLimit.success) {
    return {
      success: false,
      error: "Too many registration attempts. Please wait a minute before trying again.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { username: parsed.data.username },
      emailRedirectTo: `${input.origin}/auth/callback`,
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  // Attempt to trigger welcome email (fire-and-forget, non-blocking)
  sendWelcomeEmail(parsed.data.email, parsed.data.username).catch((e) => {
    console.error("[Auth] Welcome email error:", e);
  });

  return { success: true };
}

export async function forgotPasswordAction(
  input: z.infer<typeof forgotPasswordSchema> & { origin: string }
) {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid email address",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${input.origin}/auth/callback?next=/auth/reset-password`,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return { success: true };
}

export async function updatePasswordAction(
  input: z.infer<typeof updatePasswordSchema>
) {
  const parsed = updatePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid password",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return { success: true };
}
