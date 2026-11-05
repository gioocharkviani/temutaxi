"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Sets data-visible="true" once the element scrolls into view.
 * Children animate with `group-data-[visible=true]/reveal:*` classes.
 */
export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const show = () => (el.dataset.visible = "true");
    if (!("IntersectionObserver" in window)) return void show();

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          show();
          io.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} data-visible="false" className={`group/reveal ${className}`}>
      {children}
    </div>
  );
}
