import { site } from "@/config/site";

export type AppLinksText = {
  /** Small line above "App Store", for example "Download on the". */
  appStore: string;
  /** Small line above "Google Play", for example "Get it on". */
  googlePlay: string;
};

const apple = (
  <path d="M16.37 12.6c-.02-2.3 1.88-3.41 1.97-3.46-1.07-1.57-2.74-1.79-3.33-1.81-1.42-.14-2.77.83-3.49.83-.72 0-1.83-.81-3.01-.79-1.55.02-2.98.9-3.78 2.29-1.61 2.8-.41 6.94 1.16 9.21.77 1.11 1.68 2.36 2.88 2.31 1.16-.05 1.59-.75 2.99-.75s1.79.75 3.01.72c1.24-.02 2.03-1.13 2.79-2.25.88-1.29 1.24-2.53 1.26-2.6-.03-.01-2.42-.93-2.45-3.7ZM14.07 5.86c.64-.77 1.07-1.85.95-2.92-.92.04-2.03.61-2.69 1.38-.59.68-1.11 1.77-.97 2.82 1.02.08 2.07-.52 2.71-1.28Z" />
);

const play = (
  <>
    <path d="M3.6 2.3c-.2.2-.3.5-.3.9v17.6c0 .4.1.7.3.9l.1.1 9.9-9.9v-.2L3.7 2.2l-.1.1Z" opacity=".85" />
    <path d="m16.9 15.1-3.3-3.3v-.2l3.3-3.3.1.1 3.9 2.2c1.1.6 1.1 1.7 0 2.3l-3.9 2.2h-.1Z" />
    <path d="m17 15-3.4-3.4L3.6 21.7c.4.4 1 .4 1.7 0L17 15Z" opacity=".7" />
    <path d="M17 8.2 5.3 1.5c-.7-.4-1.3-.4-1.7 0l10 10L17 8.2Z" opacity=".55" />
  </>
);

/**
 * Buttons that open Yandex Pro, the driver app, in the App Store and Google Play.
 * With colours (a promotion's button colours) they follow the promotion; compact fits the top bar.
 */
export function AppLinks({
  t,
  tone = "light",
  colors,
  compact = false,
  className = "",
}: {
  t: AppLinksText;
  tone?: "dark" | "light";
  colors?: { background: string; text: string };
  compact?: boolean;
  className?: string;
}) {
  const style = colors
    ? "border-transparent hover:opacity-90"
    : tone === "dark"
      ? "border-dark-3 bg-dark-2 text-surface hover:border-on-dark-muted"
      : "border-ink bg-ink text-surface hover:bg-dark-2";
  const stores = [
    { href: site.yandexPro.ios, top: t.appStore, name: "App Store", icon: apple },
    { href: site.yandexPro.android, top: t.googlePlay, name: "Google Play", icon: play },
  ];

  return (
    <div className={`flex flex-wrap ${compact ? "gap-2" : "gap-3"} ${className}`}>
      {stores.map((store) => (
        <a
          key={store.name}
          href={store.href}
          target="_blank"
          rel="noopener"
          style={colors ? { background: colors.background, color: colors.text } : undefined}
          className={`inline-flex items-center rounded-2xl border text-left transition ${compact ? "h-9 gap-2 px-2.5 sm:px-3" : "h-14 min-w-44 gap-3 px-4"} ${style}`}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={`shrink-0 ${compact ? "size-4" : "size-7"}`}>
            {store.icon}
          </svg>
          {compact ? (
            <span className="sr-only text-sm font-semibold sm:not-sr-only">{store.name}</span>
          ) : (
            <span className="leading-tight">
              <span className="block text-[11px] opacity-75">{store.top}</span>
              <span className="block text-base font-semibold">{store.name}</span>
            </span>
          )}
        </a>
      ))}
    </div>
  );
}
