import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
      <h1 className="font-display text-4xl font-bold text-white">Terms of Use</h1>
      <p className="mt-2 text-sm text-muted">Last updated: September 2026</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">1. Acceptance</h2>
          <p>By using Veyra you agree to these terms. If you do not agree, do not use the service.</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">2. Content</h2>
          <p>
            Veyra is a cinema streaming and tracking platform and does not host, store, upload, or distribute any video content.
            All video playback is provided through embedded third-party players. Movie and TV metadata
            is curated and indexed within the Veyra platform.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">3. Your Account</h2>
          <p>You are responsible for maintaining the security of your account credentials. You must be at least 13 years old to create an account.</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">4. Prohibited Conduct</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Attempting to circumvent security measures</li>
            <li>Automated scraping or crawling of the service</li>
            <li>Uploading or distributing malicious content</li>
          </ul>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">5. Disclaimer</h2>
          <p>Veyra is provided &ldquo;as is&rdquo; without warranty of any kind.</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">6. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, Veyra shall not be liable for any indirect, incidental, or consequential damages.</p>
        </section>
      </div>

      <div className="mt-12">
        <Link href="/" className="text-sm text-accent hover:brightness-110">← Back to Veyra</Link>
      </div>
    </main>
  );
}
