"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PAGES = [
  { href: "/admin", label: "რეგისტრაციები" },
  { href: "/admin/rating", label: "ლიდერბორდი" },
  { href: "/admin/privacy", label: "Privacy Policy" },
  { href: "/admin/seo", label: "SEO" },
  { href: "/admin/cars", label: "მანქანების სია" },
  { href: "/admin/password", label: "პაროლი" },
];

/** A side menu on large screens, and a row that scrolls sideways on phones. */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="ადმინ პანელის გვერდები" className="lg:sticky lg:top-24 lg:self-start">
      <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:flex-col">
        {PAGES.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`block rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  active ? "bg-ink text-surface" : "text-ink-2 hover:bg-surface-3 hover:text-ink"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
