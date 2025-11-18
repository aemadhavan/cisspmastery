import type { Metadata } from "next";
import "./globals.css";
import dynamic from "next/dynamic";

// Lazy load ClerkProvider to reduce initial bundle
const ClerkProvider = dynamic(
  () => import('@clerk/nextjs').then(mod => ({ default: mod.ClerkProvider })),
  { ssr: true, loading: () => null }
);

// Lazy load non-critical components to reduce TBT
const Header = dynamic(() => import("@/components/Header"), {
  loading: () => (
    <header className="border-b border-slate-700 bg-slate-900 sticky top-0 z-50" style={{height: '64px'}} />
  ),
});

const Footer = dynamic(() => import("@/components/Footer"), {
  loading: () => null,
});

// Client-only component wrapper for Toaster
const ClientToaster = dynamic(() => import("@/components/ClientToaster"), {
  loading: () => null,
});

// Note: Using system fonts for better build compatibility
// If Google Fonts are needed, they can be loaded via CDN in production

export const metadata: Metadata = {
  title: "CISSP Mastery - Master CISSP with Confidence-Based Learning",
  description: "Master CISSP certification with our confidence-based flashcard system. Adaptive spaced repetition, progress tracking, and 1000+ flashcards across 8 domains.",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className="font-sans antialiased"
          suppressHydrationWarning
        >
          <Header />
          {children}
          <Footer />
          <ClientToaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
