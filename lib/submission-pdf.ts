import type { Submission } from "@/types/database";
import { humanizeKey, humanizeValue } from "@/lib/submission-format";

const formTypeTitles: Record<Submission["form_type"], string> = {
  contact: "Contact Form Submission",
  volunteer: "Volunteer Interest Form",
  request_help: "Request Help Form",
  adopt_application: "Adoption Application",
  foster_application: "Foster Application",
};

// Renders a submission as a paginated PDF and triggers a browser download.
// Uses jsPDF client-side (no server round trip) since this is a
// static-export site with no API routes to generate files server-side.
// Field selection, order, and the two-column layout for extra fields are
// kept in step with the admin Submissions page's expanded view so the PDF
// matches what the admin sees on screen.
export async function downloadSubmissionPdf(submission: Submission) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });

  const marginX = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - marginX * 2;
  const colGap = 24;
  const colWidth = (maxWidth - colGap) / 2;
  const colXs = [marginX, marginX + colWidth + colGap];
  let y = 56;

  function ensureSpace(lineHeight: number) {
    if (y + lineHeight > pageHeight - 48) {
      doc.addPage();
      y = 56;
    }
  }

  function writeLines(text: string, options: { size: number; bold?: boolean; gap?: number }) {
    doc.setFontSize(options.size);
    doc.setFont("helvetica", options.bold ? "bold" : "normal");
    const lines: string[] = doc.splitTextToSize(text, maxWidth);
    for (const line of lines) {
      ensureSpace(options.size + 4);
      doc.text(line, marginX, y);
      y += options.size + 4;
    }
    y += options.gap ?? 0;
  }

  function writeField(label: string, value: string) {
    ensureSpace(14);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(label.toUpperCase(), marginX, y);
    y += 12;
    writeLines(value, { size: 11, gap: 8 });
  }

  // Same two-per-row flow as the browser's `sm:grid-cols-2` details grid --
  // pairs of fields sit side by side, and a row's height follows whichever
  // of the pair wraps to more lines (matching how CSS grid rows behave).
  function writeFieldGridRow(entries: [string, string][]) {
    const labelSize = 9;
    const valueSize = 11;
    const lineHeight = valueSize + 4;

    doc.setFontSize(valueSize);
    doc.setFont("helvetica", "normal");
    const wrapped = entries.map(([, value]) => doc.splitTextToSize(value, colWidth) as string[]);
    const rowHeight = Math.max(...wrapped.map((lines) => 12 + lines.length * lineHeight)) + 8;

    ensureSpace(rowHeight);
    entries.forEach(([label], i) => {
      let cy = y;
      doc.setFontSize(labelSize);
      doc.setFont("helvetica", "bold");
      doc.text(label.toUpperCase(), colXs[i], cy);
      cy += 12;
      doc.setFontSize(valueSize);
      doc.setFont("helvetica", "normal");
      for (const line of wrapped[i]) {
        doc.text(line, colXs[i], cy);
        cy += lineHeight;
      }
    });
    y += rowHeight;
  }

  writeLines(formTypeTitles[submission.form_type] || "Form Submission", { size: 16, bold: true, gap: 4 });
  writeLines(`${submission.name} · Submitted ${new Date(submission.created_at).toLocaleString()}`, {
    size: 9,
    gap: 12,
  });

  writeField("Email", submission.email);
  if (submission.phone) writeField("Phone", submission.phone);
  const subject = humanizeValue(submission.payload?.subject);
  if (subject) writeField("Subject", subject);
  if (submission.message) writeField("Message", submission.message);

  const payload = submission.payload || {};
  const entries = Object.entries(payload)
    .filter(([key, value]) => key !== "subject" && humanizeValue(value) !== null)
    .map(([key, value]): [string, string] => [humanizeKey(key), humanizeValue(value) ?? ""]);

  if (entries.length > 0) {
    ensureSpace(20);
    y += 4;
    writeLines("Application Details", { size: 12, bold: true, gap: 6 });
    for (let i = 0; i < entries.length; i += 2) {
      writeFieldGridRow(entries.slice(i, i + 2));
    }
  }

  const datePart = new Date(submission.created_at).toISOString().slice(0, 10);
  const safeName = submission.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  doc.save(`${submission.form_type}-${safeName}-${datePart}.pdf`);
}
