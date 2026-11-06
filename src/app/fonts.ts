import { Google_Sans, Noto_Sans_Georgian } from "next/font/google";
import localFont from "next/font/local";

// Body text: Google Sans covers Georgian, Latin and Cyrillic, so all three languages share one font.
export const googleSans = Google_Sans({
  subsets: ["georgian", "latin", "latin-ext", "cyrillic"],
  variable: "--font-google-sans",
  display: "swap",
  // Next.js has no size data for this font; without an explicit fallback it warns on every page.
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: false,
});

// Headings: FiraGO, a Georgian-first typeface (also Latin + Cyrillic). OFL licence in src/fonts/firago.
export const firaGO = localFont({
  src: "../fonts/firago/FiraGO-Bold.woff2",
  weight: "700",
  variable: "--font-firago",
  display: "swap",
});

// Fallback for any Georgian glyph the fonts above might miss.
export const notoGeorgian = Noto_Sans_Georgian({
  subsets: ["georgian"],
  variable: "--font-noto-georgian",
  display: "swap",
  preload: false,
});

export const fontVariables = [googleSans.variable, firaGO.variable, notoGeorgian.variable].join(" ");
