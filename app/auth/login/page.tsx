"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2 } from "lucide-react";

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
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setServerError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) {
      setServerError(error.message);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  };

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
  };

  return (
    <div className="glass w-full max-w-md rounded-3xl p-8 shadow-2xl">
      <div className="mb-8 text-center">
        <Link href="/" className="font-display text-3xl font-bold text-white">
          <span className="text-accent">V</span>EYRA
        </Link>
        <h1 className="mt-4 font-display text-2xl font-semibold text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">Sign in to your account</p>
      </div>

      <button
        onClick={signInWithGoogle}
        className="mb-6 flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-surface py-3 text-sm font-medium text-white transition hover:bg-surface2"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs text-muted">
          <span className="bg-surface px-3">or sign in with email</span>
        </div>
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
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted">Password</label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
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
          {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
        </div>

        {serverError && (
          <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{serverError}</div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 font-semibold text-background transition hover:brightness-110 disabled:opacity-60"
        >
          {isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Sign In
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="font-semibold text-accent transition hover:brightness-110">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-16">
      <Suspense fallback={<div className="glass w-full max-w-md rounded-3xl p-8 animate-pulse h-96" />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
