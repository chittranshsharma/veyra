import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/navigation/Navbar";
import { FloatingDock } from "@/components/navigation/FloatingDock";
import { Footer } from "@/components/ui/Footer";
import { CinemaBackground } from "@/components/ui/CinemaBackground";

export const viewport: Viewport = {
  themeColor: "#0f0f13",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "Veyra — Stream Movies & TV",
    template: "%s | Veyra",
  },
  description:
    "Discover and stream thousands of movies and TV shows. Handcrafted editorial cinema experience.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    type: "website",
    siteName: "Veyra",
    title: "Veyra — Stream Movies & TV",
    description:
      "Discover and stream thousands of movies and TV shows. Handcrafted editorial cinema experience.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Veyra — Cinema Lives Here",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Veyra — Stream Movies & TV",
    description:
      "Discover and stream thousands of movies and TV shows. Handcrafted editorial cinema experience.",
    images: ["/og-image.png"],
  },
};

// Anti-FOUC inline script: reads saved theme preference before first paint
const themeInitScript = `
(function() {
  try {
    var t = localStorage.getItem('veyra_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', t);
  } catch(e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;

import { ModalProvider } from "@/components/modals/ModalContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Anti-FOUC: runs before any paint */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning>
        <CinemaBackground />
        <ModalProvider>
          <Navbar />
          <div className="min-h-[calc(100dvh-4rem)] pb-24 md:pb-0">{children}</div>
          <FloatingDock />
          <Footer />
        </ModalProvider>
      </body>
    </html>
  );
}
