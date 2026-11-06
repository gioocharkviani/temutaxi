"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Refreshes the page data while a job is running, so its result appears by itself. */
export function JobAutoRefresh({ running }: { running: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => router.refresh(), 3000);
    return () => clearInterval(timer);
  }, [running, router]);

  return null;
}
