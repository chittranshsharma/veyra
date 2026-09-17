"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signupAction } from "@/app/auth/actions";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { buttonVariants } from "@/components/ui/Button";

const signupSchema = z.object({
  username: z
    .string()
    .min(3, "At least 3 characters")
    .max(30, "Max 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, and underscores only"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "At least 8 characters"),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (data: SignupForm) => {
    setServerError("");

    const result = await signupAction({
      username: data.username,
      email: data.email,
      password: data.password,
      origin: window.location.origin,
    });

    if (!result.success) {
      setServerError(result.error ?? "Failed to create account");
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-16">
        <div className="glass w-full max-w-md rounded-3xl p-8 text-center shadow-2xl border border-border">
          <CheckCircle2 size={48} className="mx-auto text-accent" />
          <h1 className="mt-4 font-display text-2xl font-bold text-text-primary">
            Check your email
          </h1>
          <p className="mt-3 text-sm text-muted">
            We sent a confirmation link to your email. Click it to activate your
            account, then come back to sign in.
          </p>
          <Link
            href="/auth/login"
            className={buttonVariants({ variant: "primary", size: "lg", className: "mt-6" })}
          >
            Go to Sign In
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
            Create account
          </h1>
          <p className="mt-1 text-sm text-muted">Free forever, no credit card needed</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted">
              Username
            </label>
            <input
              {...register("username")}
              type="text"
              autoComplete="username"
              placeholder="cooluser42"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-muted/60 focus:border-accent/60 focus:outline-none"
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-400">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted">
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-muted/60 focus:border-accent/60 focus:outline-none"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-muted">
              Password
            </label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 pr-12 text-sm text-text-primary placeholder:text-muted/60 focus:border-accent/60 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted transition hover:text-text-primary"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
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
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
