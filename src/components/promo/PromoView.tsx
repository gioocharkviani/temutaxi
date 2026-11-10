// How a promotion looks. No data loading here, so the admin preview uses exactly the same parts.

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { PromotionColors, PromotionTheme } from "@/db/entities";
import { Icon, type IconName } from "../Icon";

export type PromoContent = {
  theme: PromotionTheme;
  colors: PromotionColors;
  icon: string | null;
  title: string;
  body: string;
  buttonText: string;
  link: string | null;
  newTab: boolean;
};

/**
 * The look around the content. Every theme uses only the four colours chosen in the admin panel:
 * solid fills the background, glow adds a soft light of the button colour, stripes adds the taxi-style
 * diagonal pattern, and outline draws a frame in the button colour.
 */
function Frame({ p, shape, className = "", children }: { p: PromoContent; shape: "banner" | "bar" | "modal"; className?: string; children: ReactNode }) {
  const style: CSSProperties = { background: p.colors.background, color: p.colors.text };
  if (p.theme === "outline") {
    style.boxShadow = shape === "bar" ? `inset 0 -3px 0 ${p.colors.button}` : `inset 0 0 0 3px ${p.colors.button}`;
  }
  return (
    <div style={style} className={`relative isolate overflow-hidden ${className}`}>
      {p.theme === "glow" && (
        <div
          aria-hidden="true"
          style={{ background: p.colors.button }}
          className={`absolute -z-10 rounded-full opacity-40 blur-3xl ${
            shape === "bar" ? "-left-10 -top-10 h-24 w-72" : shape === "modal" ? "-top-24 left-1/2 h-48 w-72 -translate-x-1/2" : "-right-16 -top-24 size-80"
          }`}
        />
      )}
      {p.theme === "stripes" && (
        <div
          aria-hidden="true"
          style={{ backgroundImage: `repeating-linear-gradient(135deg, ${p.colors.button} 0 14px, transparent 14px 28px)` }}
          className={`absolute -z-10 opacity-25 ${
            shape === "bar" ? "inset-y-0 left-0 w-3" : shape === "modal" ? "inset-x-0 top-0 h-3" : "inset-y-0 right-0 hidden w-1/3 sm:block"
          }`}
        />
      )}
      {children}
    </div>
  );
}

function PromoButton({ p, onClick, className = "" }: { p: PromoContent; onClick?: () => void; className?: string }) {
  if (!p.buttonText || !p.link) return null;
  const style = { background: p.colors.button, color: p.colors.buttonText };
  const classes = `inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl font-semibold transition hover:opacity-90 ${className}`;
  const inner = (
    <>
      {p.buttonText}
      <Icon name="arrowUpRight" className="size-4" />
    </>
  );
  // Links to this site move without a reload; others open as normal links.
  return p.link.startsWith("/") && !p.newTab ? (
    <Link href={p.link} onClick={onClick} style={style} className={classes}>{inner}</Link>
  ) : (
    <a href={p.link} onClick={onClick} target={p.newTab ? "_blank" : undefined} rel={p.newTab ? "noopener" : undefined} style={style} className={classes}>
      {inner}
    </a>
  );
}

function PromoIcon({ p, size, className = "" }: { p: PromoContent; size: "sm" | "lg"; className?: string }) {
  if (!p.icon) return null;
  // On the button colour, so the icon stays visible on any background.
  return (
    <span
      aria-hidden="true"
      style={{ background: p.colors.button, color: p.colors.buttonText }}
      className={`flex shrink-0 items-center justify-center ${size === "lg" ? "size-16 rounded-2xl" : "size-9 rounded-xl"} ${className}`}
    >
      <Icon name={p.icon as IconName} className={size === "lg" ? "size-8" : "size-5"} />
    </span>
  );
}

/** A section on the landing page. */
export function PromoBannerView({ p }: { p: PromoContent }) {
  return (
    <Frame p={p} shape="banner" className="rounded-[28px] p-6 sm:p-8 lg:p-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <PromoIcon p={p} size="lg" />
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">{p.title}</h2>
          {p.body && <p className="mt-2 max-w-3xl whitespace-pre-line leading-relaxed opacity-85">{p.body}</p>}
        </div>
        <PromoButton p={p} className="h-14 self-start px-7 text-base lg:self-center" />
      </div>
    </Frame>
  );
}

/** A narrow strip at the top of every page. */
export function PromoBarView({ p, close }: { p: PromoContent; close?: ReactNode }) {
  return (
    <Frame p={p} shape="bar">
      <div className="mx-auto flex max-w-site items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        {/* On phones the icon is left out, so the title has room. */}
        <PromoIcon p={p} size="sm" className="hidden sm:flex" />
        <p className="min-w-0 flex-1 text-sm leading-snug">
          <strong className="font-semibold">{p.title}</strong>
          {p.body && <span className="hidden opacity-85 sm:inline"> {p.body}</span>}
        </p>
        <PromoButton p={p} className="h-8 px-3 text-xs sm:h-9 sm:px-4 sm:text-sm" />
        {close}
      </div>
    </Frame>
  );
}

/** The card inside the pop-up. */
export function PromoModalCard({ p, close, titleId, onButton }: { p: PromoContent; close?: ReactNode; titleId?: string; onButton?: () => void }) {
  return (
    <Frame p={p} shape="modal" className="w-full max-w-md rounded-[28px] p-7 text-center shadow-2xl outline-none sm:p-9">
      {close && <div className="absolute right-4 top-4">{close}</div>}
      {p.icon && (
        <div className="mb-5 flex justify-center">
          <PromoIcon p={p} size="lg" />
        </div>
      )}
      <h2 id={titleId} className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">{p.title}</h2>
      {p.body && <p className="mt-3 whitespace-pre-line leading-relaxed opacity-85">{p.body}</p>}
      <PromoButton p={p} onClick={onButton} className="mt-7 h-14 w-full px-7 text-base" />
    </Frame>
  );
}

export function CloseButton({ label, onClick, color }: { label: string; onClick?: () => void; color: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{ color }}
      className="flex size-9 shrink-0 items-center justify-center rounded-full opacity-70 transition hover:bg-black/10 hover:opacity-100"
    >
      <Icon name="x" className="size-5" />
    </button>
  );
}
