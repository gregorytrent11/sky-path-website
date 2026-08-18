"use client";

import { useEffect, useRef, useState } from "react";
import RichText from "@/components/RichText";

// A plain textarea plus toolbar buttons that insert the same markers
// components/RichText.tsx understands, and a preview that renders through that
// exact component -- so the preview can't drift from the live page.

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

// Square icon buttons in a ribbon, the way Word's formatting group looks.
const TOOLBAR_BUTTON =
  "flex h-8 w-8 items-center justify-center rounded border border-transparent text-brand-charcoal hover:border-brand-soft-blue hover:bg-brand-lavender/40 focus:outline-none focus:ring-1 focus:ring-brand-purple";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Where to put the cursor after a toolbar edit. React re-renders with the
  // new value first, so the selection has to be reapplied afterwards.
  const pendingSelection = useRef<[number, number] | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    const selection = pendingSelection.current;
    if (!selection) return;
    pendingSelection.current = null;
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();
    textarea.setSelectionRange(selection[0], selection[1]);
  }, [value]);

  function applyEdit(next: string, selectionStart: number, selectionEnd: number) {
    // Toolbar insertions add characters, so they have to respect the same cap
    // the textarea enforces for typing.
    if (maxLength !== undefined && next.length > maxLength) return;
    pendingSelection.current = [selectionStart, selectionEnd];
    onChange(next);
  }

  // Expands the selection to whole lines, so clicking "Bullet" with the caret
  // mid-sentence still prefixes that entire line.
  function selectedLineRange() {
    const textarea = textareaRef.current;
    if (!textarea) return null;
    const start = value.lastIndexOf("\n", textarea.selectionStart - 1) + 1;
    const endIndex = value.indexOf("\n", textarea.selectionEnd);
    const end = endIndex === -1 ? value.length : endIndex;
    return { start, end };
  }

  function prefixLines(makePrefix: (index: number) => string) {
    const range = selectedLineRange();
    if (!range) return;
    const lines = value.slice(range.start, range.end).split("\n");
    // Toggle off if every line already carries a marker of some kind.
    const allMarked = lines.every((line) => /^\s*([-*•]|\d+[.)])\s+/.test(line));
    const rewritten = lines
      .map((line, index) =>
        allMarked
          ? line.replace(/^\s*([-*•]|\d+[.)])\s+/, "")
          : `${makePrefix(index)}${line.replace(/^\s*([-*•]|\d+[.)])\s+/, "")}`,
      )
      .join("\n");
    const next = value.slice(0, range.start) + rewritten + value.slice(range.end);
    applyEdit(next, range.start, range.start + rewritten.length);
  }

  // Bold, italic, and underline differ only in the marker they wrap with.
  function toggleWrap(marker: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd } = textarea;
    const selected = value.slice(selectionStart, selectionEnd);
    const width = marker.length;

    if (
      selected.startsWith(marker) &&
      selected.endsWith(marker) &&
      selected.length > width * 2
    ) {
      const stripped = selected.slice(width, -width);
      const next = value.slice(0, selectionStart) + stripped + value.slice(selectionEnd);
      applyEdit(next, selectionStart, selectionStart + stripped.length);
      return;
    }

    // Applying a format leaves the inner text selected, so clicking the same
    // button again should undo it. That means also checking the characters
    // just outside the selection, not only inside it.
    const before = value.slice(Math.max(0, selectionStart - width), selectionStart);
    const after = value.slice(selectionEnd, selectionEnd + width);
    // The single-star italic marker has to ignore "**", which belongs to bold
    // -- otherwise un-italicising inside a bold run would eat one of its stars
    // and silently turn the bold into italic.
    const insideWiderMarker =
      marker === "*" && value.slice(Math.max(0, selectionStart - 2), selectionStart) === "**";

    if (before === marker && after === marker && !insideWiderMarker) {
      const next = value.slice(0, selectionStart - width) + selected + value.slice(selectionEnd + width);
      applyEdit(next, selectionStart - width, selectionStart - width + selected.length);
      return;
    }

    const next = `${value.slice(0, selectionStart)}${marker}${selected}${marker}${value.slice(selectionEnd)}`;
    // With nothing selected this drops the caret between the markers so the
    // next thing typed picks up the format.
    applyEdit(next, selectionStart + width, selectionStart + width + selected.length);
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

      {/* Ribbon sits flush on top of the textarea, so the pair reads as one
          editor the way a Word document window does. */}
      <div className="mt-1 flex items-center gap-0.5 rounded-t-md border border-brand-soft-blue bg-brand-gray px-1.5 py-1">
        <button
          type="button"
          onClick={() => toggleWrap("**")}
          title="Bold"
          aria-label="Bold"
          className={`${TOOLBAR_BUTTON} font-serif text-base font-bold`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => toggleWrap("*")}
          title="Italic"
          aria-label="Italic"
          className={`${TOOLBAR_BUTTON} font-serif text-base italic`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => toggleWrap("__")}
          title="Underline"
          aria-label="Underline"
          className={`${TOOLBAR_BUTTON} font-serif text-base underline`}
        >
          U
        </button>

        <ToolbarDivider />

        <button
          type="button"
          onClick={() => prefixLines(() => "- ")}
          title="Bulleted list"
          aria-label="Bulleted list"
          className={TOOLBAR_BUTTON}
        >
          <BulletListIcon />
        </button>
        <button
          type="button"
          onClick={() => prefixLines((index) => `${index + 1}. `)}
          title="Numbered list"
          aria-label="Numbered list"
          className={TOOLBAR_BUTTON}
        >
          <NumberedListIcon />
        </button>

        <button
          type="button"
          onClick={() => setShowPreview((current) => !current)}
          className="ml-auto rounded px-2 py-1 text-xs font-medium text-brand-charcoal hover:bg-brand-lavender/40 focus:outline-none focus:ring-1 focus:ring-brand-purple"
        >
          {showPreview ? "Hide preview" : "Show preview"}
        </button>
      </div>

      <textarea
        id={id}
        ref={textareaRef}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="block w-full rounded-b-md border border-t-0 border-brand-soft-blue bg-brand-white px-3 py-2 text-sm text-brand-charcoal shadow-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple"
      />

      <p className="mt-1 text-xs text-brand-charcoal/60">
        {hint ? `${hint} ` : ""}Select text and use the buttons above, or type it directly: start a
        line with <code>-</code> for a bullet or <code>1.</code> for a numbered list, wrap text in{" "}
        <code>**stars**</code> for bold, <code>*one star*</code> for italic, or{" "}
        <code>__underscores__</code> for underline, and leave a blank line between paragraphs.
      </p>

      {showPreview && (
        <div className="mt-3 rounded-md border border-brand-soft-blue/60 bg-brand-gray p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-charcoal/60">
            Preview
          </p>
          {value.trim() ? (
            <RichText text={value} className="mt-2 text-sm leading-relaxed text-brand-charcoal" />
          ) : (
            <p className="mt-2 text-sm text-brand-charcoal/50">
              Nothing to preview yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
