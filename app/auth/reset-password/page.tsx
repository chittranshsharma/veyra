"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updatePasswordAction } from "@/app/auth/actions";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { buttonVariants } from "@/components/ui/Button";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    setServerError("");

    const result = await updatePasswordAction({
      password: data.password,
    });

    if (!result.success) {
      setServerError(result.error ?? "Failed to update password");
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push("/auth/login");
    }, 3000);
  };

  if (success) {
    return (
      <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-16">
        <div className="glass w-full max-w-md rounded-3xl p-8 text-center shadow-2xl border border-border">
          <CheckCircle2 size={48} className="mx-auto text-accent" />
          <h1 className="mt-4 font-display text-2xl font-bold text-text-primary">
            Password Updated!
          </h1>
          <p className="mt-3 text-sm text-muted">
            Your password has been changed successfully. Redirecting to sign in...
          </p>
          <Link
            href="/auth/login"
            className={buttonVariants({ variant: "primary", size: "lg", className: "mt-6" })}
          >
            Sign In Now
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
            Set new password
          </h1>
          <p className="mt-1 text-sm text-muted">
            Choose a strong password with at least 8 characters
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted">
              New Password
            </label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-surface px-4 py-3 pr-12 text-sm text-white placeholder:text-muted/60 focus:border-accent/40 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted transition hover:text-white"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted">
              Confirm New Password
            </label>
            <input
              {...register("confirmPassword")}
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/10 bg-surface px-4 py-3 text-sm text-white placeholder:text-muted/60 focus:border-accent/40 focus:outline-none"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-400">
                {errors.confirmPassword.message}
              </p>
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
            Update Password
          </button>
        </form>
      </div>
    </main>
  );
}
