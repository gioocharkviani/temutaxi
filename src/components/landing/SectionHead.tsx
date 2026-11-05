export function SectionHead({
  label,
  title,
  id,
  align = "left",
  dark = false,
}: {
  label: string;
  title: string;
  id?: string;
  align?: "left" | "center";
  dark?: boolean;
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p
        className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] ${
          dark ? "text-brand" : "text-muted"
        }`}
      >
        <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
        {label}
      </p>
      <h2
        id={id}
        className={`mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-[44px] lg:leading-[1.1] ${
          dark ? "text-surface" : "text-ink"
        }`}
      >
        {title}
      </h2>
    </div>
  );
}
