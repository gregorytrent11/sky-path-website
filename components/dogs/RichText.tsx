import { Fragment, ReactNode } from "react";

// Dog bios are stored as plain text, not HTML, so there is no injection
// surface here -- this renders a small, fixed subset of markdown-ish syntax
// into real elements:
//
//   - item / * item   bulleted list
//   1. item / 1) item numbered list
//   **bold**          bold run
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
const BOLD = /\*\*([\s\S]+?)\*\*/g;

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

// Splits on **bold** runs. An unmatched ** is left alone as literal text so a
// half-typed bio in the live preview never swallows the rest of the bio.
function renderInline(text: string): ReactNode {
  const parts = text.split(BOLD);
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <strong key={index} className="font-semibold">
        {part}
      </strong>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}

export function hasContent(text: string | null | undefined): boolean {
  return Boolean(text && parseBlocks(text).length > 0);
}

// Strips the formatting markers back out, for places that need a clean
// one-line summary rather than rendered elements (SEO meta descriptions,
// social card blurbs).
export function toPlainText(text: string): string {
  return parseBlocks(text)
    .flatMap((block) => (block.kind === "p" ? block.lines : block.items))
    .join(" ")
    .replace(BOLD, "$1")
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
