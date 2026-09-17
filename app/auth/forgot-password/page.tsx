"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { forgotPasswordAction } from "@/app/auth/actions";
import { Loader2, MailCheck, ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { buttonVariants } from "@/components/ui/Button";

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({ resolver: zodResolver(forgotSchema) });

  const onSubmit = async (data: ForgotForm) => {
    setServerError("");

    const result = await forgotPasswordAction({
      email: data.email,
      origin: window.location.origin,
    });

    if (!result.success) {
      setServerError(result.error ?? "Failed to send reset link");
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-16">
        <div className="glass w-full max-w-md rounded-3xl p-8 text-center shadow-2xl border border-border">
          <MailCheck size={48} className="mx-auto text-accent" />
          <h1 className="mt-4 font-display text-2xl font-bold text-text-primary">
            Check your email
          </h1>
          <p className="mt-3 text-sm text-muted">
            If an account exists with that email, we have sent a secure password
            reset link.
          </p>
          <Link
            href="/auth/login"
            className={buttonVariants({ variant: "primary", size: "lg", className: "mt-6" })}
          >
            <ArrowLeft size={16} /> Return to Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-16">
      <div className="glass w-full max-w-md rounded-3xl p-8 shadow-2xl border border-border">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandLogo size="lg" showTagline priority />
          <h1 className="mt-5 font-display text-2xl font-semibold text-text-primary">
            Reset password
          </h1>
          <p className="mt-1 text-sm text-muted">
            Enter your email to receive recovery instructions
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted">Email</label>
            <input
              {...register("email")}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-surface px-4 py-3 text-sm text-white placeholder:text-muted/60 focus:border-accent/40 focus:outline-none"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          {serverError && (
            <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={buttonVariants({ variant: "primary", size: "lg", className: "w-full" })}
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            Send Reset Link
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Remember your password?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-accent transition hover:brightness-110"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
