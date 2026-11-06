type Block = { kind: "heading" | "paragraph"; text: string } | { kind: "list"; items: string[] };

/** "# " starts a heading, "- " a list item, and a blank line ends a paragraph. */
function parseRules(text: string) {
  const blocks: Block[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    const last = blocks.at(-1);
    if (!line) {
      blocks.push({ kind: "paragraph", text: "" });
    } else if (line.startsWith("# ")) {
      blocks.push({ kind: "heading", text: line.slice(2).trim() });
    } else if (line.startsWith("- ")) {
      if (last?.kind === "list") last.items.push(line.slice(2).trim());
      else blocks.push({ kind: "list", items: [line.slice(2).trim()] });
    } else if (last?.kind === "paragraph" && last.text) {
      last.text += `\n${line}`;
    } else {
      blocks.push({ kind: "paragraph", text: line });
    }
  }
  return blocks.filter((block) => block.kind !== "paragraph" || block.text);
}

/** The admin's text, rendered as plain React text, so it can never inject markup into the page. */
export function RichText({ text, heading: Heading = "h3" }: { text: string; heading?: "h2" | "h3" }) {
  return (
    <div className="space-y-4 leading-relaxed text-ink-2">
      {parseRules(text).map((block, index) => {
        if (block.kind === "heading") {
          return <Heading key={index} className="pt-4 text-xl font-bold tracking-tight text-ink first:pt-0">{block.text}</Heading>;
        }
        if (block.kind === "list") {
          return (
            <ul key={index} className="space-y-2">
              {block.items.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand-hover" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        }
        return <p key={index} className="whitespace-pre-line">{block.text}</p>;
      })}
    </div>
  );
}
