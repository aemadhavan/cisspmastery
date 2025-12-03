"use client";

import { useEffect, useState } from "react";
import FloatingBadge from "@/components/FloatingBadge";

export default function ClientFloatingBadge() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <FloatingBadge />;
}
