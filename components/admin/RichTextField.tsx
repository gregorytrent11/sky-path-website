"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toHtml } from "@/components/RichText";

// A WYSIWYG editor: bold looks bold and bullets look like bullets, so there is
// nothing left to preview.
//
// What it *stores* is unchanged -- the same plain-text markers
// components/RichText.tsx reads ("- item", "**bold**", and so on). The
// contenteditable surface is converted to and from that text at the edges, so
// the database format, existing content, and the public pages all stay exactly
// as they were, and there is still no HTML anywhere to sanitise.

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  // Optional: fields like foster notes have no cap, and forcing one on an
  // existing longer note would lock the admin out of editing it.
  maxLength?: number;
  rows?: number;
  hint?: string;
  placeholder?: string;
  showWordCount?: boolean;
};

const TOOLBAR_BUTTON =
  "flex h-8 w-8 items-center justify-center rounded border text-brand-charcoal focus:outline-none focus:ring-1 focus:ring-brand-purple";
const TOOLBAR_IDLE = "border-transparent hover:border-brand-soft-blue hover:bg-brand-lavender/40";
// Word shows an active format as a pressed button; mirror that.
const TOOLBAR_ACTIVE = "border-brand-soft-blue bg-brand-lavender/70";

function BulletListIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
      <circle cx="4" cy="6" r="1.7" />
      <circle cx="4" cy="12" r="1.7" />
      <circle cx="4" cy="18" r="1.7" />
      <rect x="9" y="5" width="12" height="2" rx="1" />
      <rect x="9" y="11" width="12" height="2" rx="1" />
      <rect x="9" y="17" width="12" height="2" rx="1" />
    </svg>
  );
}

function NumberedListIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="currentColor">
      <text x="0" y="8.5" fontSize="9" fontWeight="600">
        1
      </text>
      <text x="0" y="15" fontSize="9" fontWeight="600">
        2
      </text>
      <text x="0" y="21.5" fontSize="9" fontWeight="600">
        3
      </text>
      <rect x="9" y="5" width="12" height="2" rx="1" />
      <rect x="9" y="11" width="12" height="2" rx="1" />
      <rect x="9" y="17" width="12" height="2" rx="1" />
    </svg>
  );
}

function ToolbarDivider() {
  return <span aria-hidden="true" className="mx-1 h-5 w-px bg-brand-soft-blue" />;
}

// --- contenteditable DOM -> stored marker text ------------------------------

function serializeInline(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
  if (!(node instanceof HTMLElement)) return "";

  if (node.tagName === "BR") return "\n";

  const inner = Array.from(node.childNodes).map(serializeInline).join("");
  // Wrapping empty text would leave stray ** behind in the stored value.
  if (!inner) return "";

  switch (node.tagName) {
    case "STRONG":
    case "B":
      return `**${inner}**`;
    case "EM":
    case "I":
      return `*${inner}*`;
    case "U":
      return `__${inner}__`;
    default:
      return inner;
  }
}

function serializeBlock(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
  if (!(node instanceof HTMLElement)) return "";

  if (node.tagName === "UL") {
    return Array.from(node.children)
      .map((li) => `- ${serializeInline(li)}`)
      .join("\n");
  }
  if (node.tagName === "OL") {
    return Array.from(node.children)
      .map((li, index) => `${index + 1}. ${serializeInline(li)}`)
      .join("\n");
  }
  return serializeInline(node);
}

function serialize(root: HTMLElement): string {
  return Array.from(root.childNodes)
    .map(serializeBlock)
    // contenteditable pads empty lines with non-breaking spaces.
    .map((block) => block.replace(/ /g, " ").trimEnd())
    .filter((block) => block.trim() !== "")
    .join("\n\n");
}

// ---------------------------------------------------------------------------

export default function RichTextField({
  id,
  label,
  value,
  onChange,
  maxLength,
  rows = 8,
  hint,
  placeholder,
  showWordCount = false,
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  // The last value this component produced. Rewriting innerHTML on every
  // render would send the caret back to the start on each keystroke, so an
  // incoming value is only applied when it came from somewhere else.
  const lastEmitted = useRef<string | null>(null);
  const [active, setActive] = useState({ bold: false, italic: false, underline: false });

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (value === lastEmitted.current) return;
    editor.innerHTML = toHtml(value);
    lastEmitted.current = value;
  }, [value]);

  const refreshActive = useCallback(() => {
    setActive({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
    });
  }, []);

  function emit() {
    const editor = editorRef.current;
    if (!editor) return;
    const next = serialize(editor);
    lastEmitted.current = next;
    onChange(next);
    refreshActive();
  }

  function run(command: string) {
    // Without this Chrome writes <span style="font-weight:bold"> rather than
    // <strong>, which serialize() has no marker for.
    document.execCommand("styleWithCSS", false, "false");
    document.execCommand(command);
    editorRef.current?.focus();
    emit();
  }

  // Pasting from Word or a web page would otherwise drop styled markup into
  // the editor that has no marker equivalent.
  function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    document.execCommand("insertText", false, event.clipboardData.getData("text/plain"));
  }

  function handleBeforeInput(event: React.FormEvent<HTMLDivElement>) {
    if (maxLength === undefined) return;
    const inputType = (event.nativeEvent as InputEvent).inputType ?? "";
    if (inputType.startsWith("delete") || inputType.startsWith("history")) return;
    if (value.length >= maxLength) event.preventDefault();
  }

  const overLimit = maxLength !== undefined && value.length > maxLength;
  const wordCount = value.trim() === "" ? 0 : value.trim().split(/\s+/).length;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="block text-sm font-medium text-brand-charcoal">
          {label}
        </label>
        <span className={`text-xs ${overLimit ? "text-red-600" : "text-brand-charcoal/60"}`}>
          {showWordCount ? `${wordCount} words · ` : ""}
          {value.length}
          {maxLength !== undefined ? `/${maxLength}` : ""}
          {showWordCount ? " characters" : ""}
        </span>
      </div>

      {/* Ribbon sits flush on top of the editor, so the pair reads as one
          window the way a Word document does. */}
      <div className="mt-1 flex items-center gap-0.5 rounded-t-md border border-brand-soft-blue bg-brand-gray px-1.5 py-1">
        <button
          type="button"
          onClick={() => run("bold")}
          title="Bold"
          aria-label="Bold"
          aria-pressed={active.bold}
          className={`${TOOLBAR_BUTTON} ${active.bold ? TOOLBAR_ACTIVE : TOOLBAR_IDLE} font-serif text-base font-bold`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => run("italic")}
          title="Italic"
          aria-label="Italic"
          aria-pressed={active.italic}
          className={`${TOOLBAR_BUTTON} ${active.italic ? TOOLBAR_ACTIVE : TOOLBAR_IDLE} font-serif text-base italic`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => run("underline")}
          title="Underline"
          aria-label="Underline"
          aria-pressed={active.underline}
          className={`${TOOLBAR_BUTTON} ${active.underline ? TOOLBAR_ACTIVE : TOOLBAR_IDLE} font-serif text-base underline`}
        >
          U
        </button>

        <ToolbarDivider />

        <button
          type="button"
          onClick={() => run("insertUnorderedList")}
          title="Bulleted list"
          aria-label="Bulleted list"
          className={`${TOOLBAR_BUTTON} ${TOOLBAR_IDLE}`}
        >
          <BulletListIcon />
        </button>
        <button
          type="button"
          onClick={() => run("insertOrderedList")}
          title="Numbered list"
          aria-label="Numbered list"
          className={`${TOOLBAR_BUTTON} ${TOOLBAR_IDLE}`}
        >
          <NumberedListIcon />
        </button>
      </div>

      <div className="relative">
        <div
          id={id}
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label={label}
          onInput={emit}
          onBeforeInput={handleBeforeInput}
          onPaste={handlePaste}
          onKeyUp={refreshActive}
          onMouseUp={refreshActive}
          onFocus={refreshActive}
          style={{ minHeight: `${rows * 1.5 + 1}rem` }}
          className="block w-full rounded-b-md border border-t-0 border-brand-soft-blue bg-brand-white px-3 py-2 text-sm text-brand-charcoal shadow-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple [&_em]:italic [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_strong]:font-semibold [&_u]:underline [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
        />
        {value.trim() === "" && placeholder && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-2 text-sm text-brand-charcoal/40"
          >
            {placeholder}
          </span>
        )}
      </div>

      <p className="mt-1 text-xs text-brand-charcoal/60">
        {hint ? `${hint} ` : ""}Select text and use the buttons above to format it. What you see
        here is how it will appear on the site.
      </p>
    </div>
  );
}
