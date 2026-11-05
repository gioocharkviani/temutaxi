import type { Dictionary } from "@/i18n/dictionaries/en";
import { Icon, type IconName } from "../Icon";
import { Reveal } from "../Reveal";
import { SectionHead } from "./SectionHead";

// Same order as dictionary steps.items
const icons: IconName[] = ["fileText", "user", "upload", "clock", "badgeCheck"];

export function Steps({ t }: { t: Dictionary["steps"] }) {
  const last = t.items.length - 1;

  return (
    <section id="steps" aria-labelledby="steps-title" className="relative overflow-hidden bg-surface">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--color-line)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)] opacity-60"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionHead id="steps-title" label={t.label} title={t.title} />

        <Reveal className="relative mt-14">
          {/* Track: vertical on mobile, horizontal from md. The yellow fill grows in when revealed. */}
          <div aria-hidden="true" className="absolute bottom-20 left-7 top-7 w-0.5 rounded-full bg-line md:bottom-auto md:left-[10%] md:right-[10%] md:top-7 md:h-0.5 md:w-auto">
            <div className="h-full w-full origin-top scale-y-0 rounded-full bg-brand transition-transform duration-[1400ms] ease-out group-data-[visible=true]/reveal:scale-y-100 md:origin-left md:scale-x-0 md:scale-y-100 md:group-data-[visible=true]/reveal:scale-x-100" />
          </div>

          <ol className="relative grid gap-5 md:grid-cols-5 md:gap-4">
            {t.items.map((step, i) => {
              const final = i === last;
              return (
                <li
                  key={step}
                  style={{ transitionDelay: `${i * 140}ms` }}
                  className="group flex translate-y-4 gap-5 opacity-0 transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[visible=true]/reveal:translate-y-0 group-data-[visible=true]/reveal:opacity-100 md:flex-col md:items-center md:gap-6"
                >
                  {/* Node on the track */}
                  <span
                    className={`relative z-10 flex size-14 shrink-0 items-center justify-center rounded-2xl ring-8 ring-surface transition duration-300 group-hover:-translate-y-1 group-hover:rotate-[-4deg] ${
                      final ? "bg-brand text-ink shadow-lg shadow-brand/40" : "bg-ink text-brand"
                    }`}
                  >
                    <Icon name={icons[i]} className="size-6" />
                    {final && <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-2xl bg-brand/40 [animation-duration:2.2s]" />}
                  </span>

                  {/* Card */}
                  <div
                    className={`relative flex-1 overflow-hidden rounded-3xl border p-5 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-ink/5 md:w-full md:p-6 md:text-center ${
                      final ? "border-brand bg-brand-tint" : "border-line-soft bg-surface-2 group-hover:border-line group-hover:bg-surface"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute -bottom-4 -right-1 font-display text-7xl leading-none md:-right-2 ${
                        final ? "text-brand/50" : "text-ink/[0.05]"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${final ? "text-ink-2" : "text-faint"}`}>
                      {String(i + 1).padStart(2, "0")} / {String(t.items.length).padStart(2, "0")}
                    </p>
                    <p className="relative mt-2 font-semibold leading-snug text-ink">{step}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
