import type { jsPDF } from "jspdf";
import type { Submission } from "@/types/database";
import { humanizeKey, humanizeValue } from "@/lib/submission-format";
import {
  layoutApplication,
  type ResolvedField,
  type ResolvedRow,
  type ResolvedSection,
} from "@/lib/application-layouts";

const formTypeTitles: Record<Submission["form_type"], string> = {
  contact: "Contact Form Submission",
  volunteer: "Volunteer Interest Form",
  request_help: "Request Help Form",
  adopt_application: "Adoption Application",
  foster_application: "Foster Application",
};

type Rgb = [number, number, number];
const DEEP_BLUE: Rgb = [30, 58, 114];
const SOFT_BLUE: Rgb = [169, 194, 232];
const PURPLE: Rgb = [109, 74, 163];
const GRAY: Rgb = [244, 245, 247];
const CHARCOAL: Rgb = [39, 39, 42];
const MUTED: Rgb = [113, 113, 122];

// jsPDF's built-in Helvetica only covers Latin-1; anything else prints as
// garbage. Applicants paste curly quotes and dashes from their phones.
function pdfSafe(text: string): string {
  return text
    .replace(/[\u2018\u2019\u201A\u2032]/g, "'")
    .replace(/[\u201C\u201D\u201E\u2033]/g, '"')
    .replace(/[\u2013\u2014\u2212]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u2022/g, "\u00B7")
    .replace(/[\u00A0\u2007\u202F]/g, " ")
    .replace(/\r\n?/g, "\n")
    .replace(/[^\n\u0020-\u007E\u00A1-\u00FF]/g, "");
}

// Contact / volunteer / request-help submissions have no form layout; give
// them one plain section so they still print through the same renderer.
function genericSections(submission: Submission): ResolvedSection[] {
  const entries: [string, string][] = [["Name", submission.name], ["Email", submission.email]];
  if (submission.phone) entries.push(["Phone", submission.phone]);
  if (submission.message) entries.push(["Message", submission.message]);
  for (const [key, value] of Object.entries(submission.payload || {})) {
    const display = humanizeValue(value);
    if (display !== null) entries.push([humanizeKey(key), display]);
  }
  return [
    {
      title: "Details",
      rows: entries.map(([label, value]) => ({
        kind: "fields",
        columns: 1,
        fields: [{ key: label, label, value, selected: [] }],
      })),
    },
  ];
}

// Lays a submission out the way the applicant saw the form: section
// headings, the original question wording, fields side by side where the
// form has them side by side, answers in input-style boxes, and radio /
// checkbox questions drawn with the chosen option marked. Uses jsPDF
// client-side since this is a static-export site with no API routes.
export async function buildSubmissionPdf(submission: Submission): Promise<{ doc: jsPDF; filename: string }> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });

  const marginX = 48;
  const top = 56;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const bottom = pageHeight - 56;
  const maxWidth = pageWidth - marginX * 2;
  const colGap = 16;

  const labelSize = 9;
  const labelLine = 11.5;
  const valueSize = 10.5;
  const valueLine = 14;
  const boxPad = 6;
  const optionLine = 16;
  const rowGap = 10;

  let y = top;

  function ensureSpace(height: number) {
    if (y + height > bottom) {
      doc.addPage();
      y = top;
    }
  }

  function wrap(text: string, width: number, size: number, bold = false): string[] {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    return doc.splitTextToSize(pdfSafe(text), width) as string[];
  }

  type OptionMark = { text: string; x: number; line: number; on: boolean };
  type Measured = {
    field: ResolvedField;
    x: number;
    width: number;
    labelLines: string[];
    valueLines: string[];
    options: OptionMark[];
    optionRows: number;
    height: number;
  };

  function measure(field: ResolvedField, x: number, width: number): Measured {
    const base = { field, x, width, labelLines: [], valueLines: [], options: [], optionRows: 0 };

    if (field.agreement) {
      const valueLines = wrap(field.label, width - 18, 9.5);
      return { ...base, valueLines, height: Math.max(valueLines.length * 12.5, 12) };
    }

    const labelLines = wrap(field.label, width, labelSize, true);
    const labelHeight = labelLines.length * labelLine + 3;

    if (field.options) {
      const options: OptionMark[] = [];
      let optionRows = 1;
      if (field.multiple) {
        // Two columns, like the form's checkbox grid.
        const perRow = width > 300 ? 2 : 1;
        field.options.forEach((text, i) => {
          options.push({ text, x: (i % perRow) * (width / perRow), line: Math.floor(i / perRow), on: field.selected.includes(text) });
        });
        optionRows = Math.ceil(field.options.length / perRow);
      } else {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        let cx = 0;
        let line = 0;
        for (const text of field.options) {
          const optionWidth = 14 + doc.getTextWidth(pdfSafe(text));
          if (cx > 0 && cx + optionWidth > width) {
            cx = 0;
            line += 1;
          }
          options.push({ text, x: cx, line, on: field.selected.includes(text) });
          cx += optionWidth + 18;
        }
        optionRows = line + 1;
      }
      return { ...base, labelLines, options, optionRows, height: labelHeight + optionRows * optionLine };
    }

    const valueLines = wrap(field.value ?? "Not answered", width - boxPad * 2 - 2, valueSize);
    return { ...base, labelLines, valueLines, height: labelHeight + valueLines.length * valueLine + boxPad * 2 };
  }

  function drawLabel(m: Measured, startY: number): number {
    doc.setFontSize(labelSize);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...CHARCOAL);
    let cy = startY + labelSize;
    for (const line of m.labelLines) {
      doc.text(line, m.x, cy);
      cy += labelLine;
    }
    return startY + m.labelLines.length * labelLine + 3;
  }

  function drawAnswerBox(m: Measured, lines: string[], startY: number): number {
    const height = lines.length * valueLine + boxPad * 2;
    doc.setFillColor(...GRAY);
    doc.setDrawColor(...SOFT_BLUE);
    doc.setLineWidth(0.75);
    doc.roundedRect(m.x, startY, m.width, height, 4, 4, "FD");
    doc.setFontSize(valueSize);
    const blank = m.field.value === null;
    doc.setFont("helvetica", blank ? "italic" : "normal");
    doc.setTextColor(...(blank ? MUTED : CHARCOAL));
    let cy = startY + boxPad + valueSize - 1;
    for (const line of lines) {
      doc.text(line, m.x + boxPad, cy);
      cy += valueLine;
    }
    return startY + height;
  }

  function drawCheck(x: number, cy: number) {
    doc.setDrawColor(...PURPLE);
    doc.setLineWidth(1.4);
    doc.line(x + 2, cy, x + 4, cy + 2.5);
    doc.line(x + 4, cy + 2.5, x + 8, cy - 2.5);
  }

  function drawOptions(m: Measured, startY: number) {
    for (const option of m.options) {
      const ox = m.x + option.x;
      const cy = startY + option.line * optionLine + optionLine / 2;
      doc.setDrawColor(...(option.on ? PURPLE : MUTED));
      doc.setLineWidth(0.9);
      doc.setFillColor(255, 255, 255);
      if (m.field.multiple) {
        doc.rect(ox, cy - 4.5, 9, 9, "FD");
        if (option.on) drawCheck(ox - 0.5, cy);
      } else {
        doc.circle(ox + 4.5, cy, 4.5, "FD");
        if (option.on) {
          doc.setFillColor(...PURPLE);
          doc.circle(ox + 4.5, cy, 2.4, "F");
        }
      }
      doc.setFontSize(10);
      doc.setFont("helvetica", option.on ? "bold" : "normal");
      doc.setTextColor(...(option.on ? CHARCOAL : MUTED));
      doc.text(pdfSafe(option.text), ox + 14, cy + 3.4);
    }
  }

  function drawAgreement(m: Measured, startY: number) {
    doc.setDrawColor(...(m.field.checked ? PURPLE : MUTED));
    doc.setLineWidth(0.9);
    doc.setFillColor(255, 255, 255);
    doc.rect(m.x, startY + 1, 10, 10, "FD");
    if (m.field.checked) drawCheck(m.x, startY + 6);
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...CHARCOAL);
    let cy = startY + 9;
    for (const line of m.valueLines) {
      doc.text(line, m.x + 18, cy);
      cy += 12.5;
    }
  }

  function drawRow(row: Extract<ResolvedRow, { kind: "fields" }>) {
    const width = (maxWidth - colGap * (row.columns - 1)) / row.columns;
    const measured = row.fields.map((field, i) => measure(field, marginX + i * (width + colGap), width));
    const rowHeight = Math.max(...measured.map((m) => m.height));

    // A long essay answer can run past one page: keep the question with its
    // first lines, then carry the rest over in a box per page.
    const only = measured[0];
    if (row.columns === 1 && !only.field.options && !only.field.agreement && y + rowHeight > bottom) {
      const labelHeight = only.labelLines.length * labelLine + 3;
      ensureSpace(labelHeight + boxPad * 2 + Math.min(only.valueLines.length, 3) * valueLine);
      y = drawLabel(only, y);
      const remaining = [...only.valueLines];
      while (remaining.length > 0) {
        const fits = Math.max(1, Math.floor((bottom - y - boxPad * 2) / valueLine));
        y = drawAnswerBox(only, remaining.splice(0, fits), y);
        if (remaining.length > 0) {
          doc.addPage();
          y = top;
        }
      }
      y += rowGap;
      return;
    }

    ensureSpace(rowHeight);
    for (const m of measured) {
      if (m.field.agreement) {
        drawAgreement(m, y);
      } else {
        const bodyY = drawLabel(m, y);
        if (m.field.options) drawOptions(m, bodyY);
        else drawAnswerBox(m, m.valueLines, bodyY);
      }
    }
    y += rowHeight + rowGap;
  }

  function drawSectionHeading(title: string, keepWith: number) {
    ensureSpace(34 + keepWith);
    y += 8;
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DEEP_BLUE);
    doc.text(pdfSafe(title), marginX, y + 11);
    y += 18;
    doc.setDrawColor(...SOFT_BLUE);
    doc.setLineWidth(1);
    doc.line(marginX, y, marginX + maxWidth, y);
    y += 12;
  }

  const title = formTypeTitles[submission.form_type] || "Form Submission";

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PURPLE);
  doc.text("SKY'S PATH TO HOME", marginX, y, { charSpace: 1.2 });
  y += 24;
  doc.setFontSize(20);
  doc.setTextColor(...DEEP_BLUE);
  doc.text(title, marginX, y);
  y += 16;
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.text(
    pdfSafe(`${submission.name}  \u00B7  Submitted ${new Date(submission.created_at).toLocaleString()}`),
    marginX,
    y
  );
  y += 10;

  const sections = layoutApplication(submission) ?? genericSections(submission);
  for (const section of sections) {
    if (section.rows.length === 0) continue;
    drawSectionHeading(section.title, 60);
    for (const row of section.rows) {
      if (row.kind === "subheading") {
        ensureSpace(70);
        y += 4;
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DEEP_BLUE);
        doc.text(pdfSafe(row.text), marginX, y + 9);
        y += 20;
      } else {
        drawRow(row);
      }
    }
  }

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(pdfSafe(`Sky's Path to Home  \u00B7  ${title}  \u00B7  ${submission.name}`), marginX, pageHeight - 30);
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - marginX, pageHeight - 30, { align: "right" });
  }

  const datePart = new Date(submission.created_at).toISOString().slice(0, 10);
  const safeName = submission.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  return { doc, filename: `${submission.form_type}-${safeName}-${datePart}.pdf` };
}

export async function downloadSubmissionPdf(submission: Submission) {
  const { doc, filename } = await buildSubmissionPdf(submission);
  doc.save(filename);
}
