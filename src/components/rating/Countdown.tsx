"use client";

import { useEffect, useState } from "react";

export type CountdownText = {
  endsIn: string;
  startsIn: string;
  ended: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Time left until a fixed leaderboard period starts or ends. The server passes the dates; the clock runs in the browser. */
export function Countdown({ from, to, t, className = "" }: { from: string; to: string; t: CountdownText; className?: string }) {
  // Unknown until the page runs in the browser, so the server and browser render the same markup.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const timer = setInterval(tick, SECOND);
    return () => clearInterval(timer);
  }, []);

  const start = Date.parse(from);
  const end = Date.parse(to);
  if (now !== null && now >= end) {
    return (
      <p role="status" className={`rounded-xl bg-dark-2 px-4 py-2.5 text-sm font-semibold ${className}`}>
        {t.ended}
      </p>
    );
  }

  const before = now !== null && now < start;
  const left = now === null ? null : Math.max(0, (before ? start : end) - now);
  const parts = [
    { value: left === null ? null : Math.floor(left / DAY), label: t.days },
    { value: left === null ? null : Math.floor((left % DAY) / HOUR), label: t.hours },
    { value: left === null ? null : Math.floor((left % HOUR) / MINUTE), label: t.minutes },
    { value: left === null ? null : Math.floor((left % MINUTE) / SECOND), label: t.seconds },
  ];
  const label = before ? t.startsIn : t.endsIn;

  return (
    <div className={className}>
      <p className="text-sm text-on-dark-muted">{label}</p>
      {/* Read once by screen readers instead of every second. */}
      <p className="sr-only">
        {label}: {parts.map((p) => `${p.value ?? "—"} ${p.label}`).join(", ")}
      </p>
      <div aria-hidden="true" className="mt-2 flex gap-2">
        {parts.map((p, i) => (
          <div key={p.label} className={`flex min-w-16 flex-col items-center rounded-xl px-3 py-2 ${i === 0 ? "bg-brand text-ink" : "bg-dark-2"}`}>
            <span className="text-2xl font-bold tabular-nums leading-tight">
              {p.value === null ? "--" : i === 0 ? p.value : String(p.value).padStart(2, "0")}
            </span>
            <span className={`text-[11px] ${i === 0 ? "text-ink-2" : "text-on-dark-muted"}`}>{p.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
