import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
      <h1 className="font-display text-4xl font-bold text-white">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted">Last updated: September 2026</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">1. What We Collect</h2>
          <p>
            Veyra collects only the data necessary to provide its services: your email
            address (for authentication), a username you choose, and your watch progress
            and watchlist data stored in our database.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">2. How We Use It</h2>
          <p>
            Your data is used solely to provide personalised features (watch history,
            watchlist, continue-watching). We do not sell your data to third parties.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">3. Third-Party Services</h2>
          <p>
            Veyra curates comprehensive movie and TV metadata through its internal catalog. Video playback is provided by integrated streaming endpoints. Authentication and database management are powered by{" "}
            <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-accent hover:brightness-110">
              Supabase
            </a>.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">4. Data Deletion</h2>
          <p>You can delete your account and all associated data at any time from your account settings.</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">5. Cookies</h2>
          <p>We use session cookies solely for authentication. No advertising or tracking cookies are used.</p>
        </section>
      </div>

      <div className="mt-12">
        <Link href="/" className="text-sm text-accent hover:brightness-110">← Back to Veyra</Link>
      </div>
    </main>
  );
}
