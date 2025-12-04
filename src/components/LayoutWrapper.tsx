"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClientToaster from "@/components/ClientToaster";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");

  if (isAuthPage) {
    return (
      <>
        {children}
        <ClientToaster />
      </>
    );
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
      <ClientToaster />
    </>
  );
}
