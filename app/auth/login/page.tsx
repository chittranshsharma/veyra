"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginAction } from "@/app/auth/actions";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { buttonVariants } from "@/components/ui/Button";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/";
  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setServerError("");

    const result = await loginAction({
      email: data.email,
      password: data.password,
    });

    if (!result.success) {
      setServerError(result.error ?? "Failed to sign in");
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div className="glass w-full max-w-md rounded-3xl p-8 shadow-2xl border border-border">
      <div className="mb-8 flex flex-col items-center text-center">
        <BrandLogo size="lg" showTagline priority />
        <h1 className="mt-5 font-display text-2xl font-semibold text-text-primary">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted">Email</label>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-muted/60 focus:border-accent/60 focus:outline-none"
          />
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-sm font-medium text-muted">Password</label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-accent transition hover:brightness-110"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              {...register("password")}
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
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
          {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
        </div>

        {serverError && (
          <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{serverError}</div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={buttonVariants({ variant: "primary", size: "lg", className: "w-full" })}
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Sign In
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link
          href={`/auth/signup?redirectTo=${encodeURIComponent(redirectTo)}`}
          className="text-accent hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-16">
      <Suspense fallback={<div className="h-96 w-full max-w-md rounded-3xl bg-surface/50 animate-pulse" />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
