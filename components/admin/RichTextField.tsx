"use client";

import { useEffect, useRef, useState } from "react";
import RichText from "@/components/dogs/RichText";

// A plain textarea plus toolbar buttons that insert the same markers
// components/dogs/RichText.tsx understands, and a preview that renders through
// that exact component -- so the preview can't drift from the real dog page.

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  rows?: number;
  hint?: string;
  placeholder?: string;
  showWordCount?: boolean;
};

const TOOLBAR_BUTTON =
  "rounded border border-brand-soft-blue bg-brand-white px-2 py-1 text-xs font-medium text-brand-charcoal hover:bg-brand-lavender/30 focus:outline-none focus:ring-1 focus:ring-brand-purple";

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
    if (next.length > maxLength) return;
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

  function toggleBold() {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd } = textarea;
    const selected = value.slice(selectionStart, selectionEnd);

    if (selected.startsWith("**") && selected.endsWith("**") && selected.length > 4) {
      const stripped = selected.slice(2, -2);
      const next = value.slice(0, selectionStart) + stripped + value.slice(selectionEnd);
      applyEdit(next, selectionStart, selectionStart + stripped.length);
      return;
    }

    const next = `${value.slice(0, selectionStart)}**${selected}**${value.slice(selectionEnd)}`;
    // With nothing selected this drops the caret between the markers so the
    // next thing typed is bold.
    applyEdit(
      next,
      selectionStart + 2,
      selectionStart + 2 + selected.length,
    );
  }

  const overLimit = value.length > maxLength;
  const wordCount = value.trim() === "" ? 0 : value.trim().split(/\s+/).length;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="block text-sm font-medium text-brand-charcoal">
          {label}
        </label>
        <span className={`text-xs ${overLimit ? "text-red-600" : "text-brand-charcoal/60"}`}>
          {showWordCount ? `${wordCount} words · ` : ""}
          {value.length}/{maxLength}
          {showWordCount ? " characters" : ""}
        </span>
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => prefixLines(() => "- ")} className={TOOLBAR_BUTTON}>
          &bull; Bullet
        </button>
        <button
          type="button"
          onClick={() => prefixLines((index) => `${index + 1}. `)}
          className={TOOLBAR_BUTTON}
        >
          1. Number
        </button>
        <button type="button" onClick={toggleBold} className={`${TOOLBAR_BUTTON} font-bold`}>
          B Bold
        </button>
        <button
          type="button"
          onClick={() => setShowPreview((current) => !current)}
          className={`${TOOLBAR_BUTTON} ml-auto`}
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
        className="mt-2 block w-full rounded-md border border-brand-soft-blue bg-brand-white px-3 py-2 text-sm text-brand-charcoal shadow-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple"
      />

      <p className="mt-1 text-xs text-brand-charcoal/60">
        {hint ? `${hint} ` : ""}Start a line with <code>-</code> for a bullet or <code>1.</code> for a
        numbered list, wrap text in <code>**stars**</code> for bold, and leave a blank line between
        paragraphs.
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
