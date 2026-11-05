import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, hasLocale, locales, type Locale } from "./i18n/config";

function getLocale(request: NextRequest): Locale {
  const saved = request.cookies.get("NEXT_LOCALE")?.value;
  return saved && hasLocale(saved) ? saved : defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasPrefix = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasPrefix) return;

  request.nextUrl.pathname = `/${getLocale(request)}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next|api|fonts|favicon.ico|.*\\..*).*)"],
};
