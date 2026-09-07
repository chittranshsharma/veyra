import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: {
    default: "Veyra — Stream Movies & TV",
    template: "%s | Veyra",
  },
  description:
    "Discover and stream thousands of movies and TV shows. Metadata provided by TMDB.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    siteName: "Veyra",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Navbar />
        <div className="min-h-[calc(100dvh-4rem)]">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
