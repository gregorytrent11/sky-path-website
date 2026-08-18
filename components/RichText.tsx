import { Fragment, ReactNode } from "react";

// Dog bios are stored as plain text, not HTML, so there is no injection
// surface here -- this renders a small, fixed subset of markdown-ish syntax
// into real elements:
//
//   - item / * item   bulleted list
//   1. item / 1) item numbered list
//   **bold**          bold run
//   *italic*          italic run
//   __underline__     underlined run
//   blank line        paragraph break
//
// Anything else is left as literal text. Both the public dog page and the
// admin editor's live preview render through this, so what an admin sees
// while typing is what visitors get.

type Block =
  | { kind: "p"; lines: string[] }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] };

const BULLET = /^\s*[-*•]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;
// [\s\S] rather than `.` with the `s` flag, which this tsconfig target rejects.
// Order matters: ** is tried before * so "**bold**" isn't read as an italic
// run wrapping a stray asterisk.
// *** is listed first because applying bold and then italic to the same
// selection in the editor produces ***text***, which would otherwise be read
// as a bold run wrapping a stray asterisk.
const INLINE_RULES = [
  { regex: /\*\*\*([\s\S]+?)\*\*\*/, tag: "strong", className: "font-semibold italic" },
  { regex: /\*\*([\s\S]+?)\*\*/, tag: "strong", className: "font-semibold" },
  { regex: /__([\s\S]+?)__/, tag: "u", className: "underline" },
  { regex: /\*([\s\S]+?)\*/, tag: "em", className: "italic" },
] as const;

const STRIP_INLINE = [
  /\*\*\*([\s\S]+?)\*\*\*/g,
  /\*\*([\s\S]+?)\*\*/g,
  /__([\s\S]+?)__/g,
  /\*([\s\S]+?)\*/g,
];

export function parseBlocks(text: string): Block[] {
  const blocks: Block[] = [];

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    const previous = blocks[blocks.length - 1];

    if (!line.trim()) {
      // A blank line closes whatever block is open, so the next line starts
      // a fresh paragraph or list.
      if (previous) blocks.push({ kind: "p", lines: [] });
      continue;
    }

    const bullet = line.match(BULLET);
    if (bullet) {
      if (previous?.kind === "ul") previous.items.push(bullet[1]);
      else blocks.push({ kind: "ul", items: [bullet[1]] });
      continue;
    }

    const numbered = line.match(NUMBERED);
    if (numbered) {
      if (previous?.kind === "ol") previous.items.push(numbered[1]);
      else blocks.push({ kind: "ol", items: [numbered[1]] });
      continue;
    }

    // Consecutive plain lines stay in one paragraph and keep their single
    // line breaks, matching the `whitespace-pre-line` behaviour bios had
    // before formatting was introduced.
    if (previous?.kind === "p") previous.lines.push(line);
    else blocks.push({ kind: "p", lines: [line] });
  }

  return blocks.filter((block) => (block.kind === "p" ? block.lines.length > 0 : block.items.length > 0));
}

// Recursively applies the earliest inline marker, then re-runs over both the
// wrapped text and the remainder, so formats nest ("**bold with _*italic*_**")
// instead of only the outermost one winning. An unmatched marker is left as
// literal text, so a half-typed bio in the live preview never swallows the
// rest of the bio.
function renderInline(text: string): ReactNode {
  let earliest: { index: number; match: RegExpMatchArray; rule: (typeof INLINE_RULES)[number] } | null =
    null;

  for (const rule of INLINE_RULES) {
    const match = text.match(rule.regex);
    if (!match || match.index === undefined) continue;
    // Strictly less-than keeps the INLINE_RULES order as the tie-break, which
    // is what makes ** beat * when both match at the same position.
    if (!earliest || match.index < earliest.index) {
      earliest = { index: match.index, match, rule };
    }
  }

  if (!earliest) return text;

  const { index, match, rule } = earliest;
  const Tag = rule.tag;
  return (
    <Fragment>
      {text.slice(0, index)}
      <Tag className={rule.className}>{renderInline(match[1])}</Tag>
      {renderInline(text.slice(index + match[0].length))}
    </Fragment>
  );
}

export function hasContent(text: string | null | undefined): boolean {
  return Boolean(text && parseBlocks(text).length > 0);
}

// Strips the formatting markers back out, for places that need a clean
// one-line summary rather than rendered elements (SEO meta descriptions,
// social card blurbs).
export function toPlainText(text: string): string {
  const joined = parseBlocks(text)
    .flatMap((block) => (block.kind === "p" ? block.lines : block.items))
    .join(" ");
  return STRIP_INLINE.reduce((acc, regex) => acc.replace(regex, "$1"), joined)
    .replace(/\s+/g, " ")
    .trim();
}

export default function RichText({ text, className }: { text: string; className?: string }) {
  const blocks = parseBlocks(text);
  if (blocks.length === 0) return null;

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        // `first:mt-0` keeps the block from adding space above itself when the
        // caller has already positioned the container.
        if (block.kind === "ul") {
          return (
            <ul key={index} className="mt-3 list-disc space-y-1 pl-5 first:mt-0">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }

        if (block.kind === "ol") {
          return (
            <ol key={index} className="mt-3 list-decimal space-y-1 pl-5 first:mt-0">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </ol>
          );
        }

        return (
          <p key={index} className="mt-3 whitespace-pre-line first:mt-0">
            {renderInline(block.lines.join("\n"))}
          </p>
        );
      })}
    </div>
  );
}
