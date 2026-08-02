import type { Submission } from "@/types/database";
import { humanizeKey, humanizeValue } from "@/lib/submission-format";

const formTypeTitles: Record<Submission["form_type"], string> = {
  contact: "Contact Form Submission",
  volunteer: "Volunteer Interest Form",
  request_help: "Request Help Form",
  adopt_application: "Adoption Application",
  foster_application: "Foster Application",
};

// Renders a submission as a simple paginated PDF and triggers a browser
// download. Uses jsPDF client-side (no server round trip) since this is a
// static-export site with no API routes to generate files server-side.
export async function downloadSubmissionPdf(submission: Submission) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });

  const marginX = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - marginX * 2;
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

  writeLines(formTypeTitles[submission.form_type] || "Form Submission", { size: 16, bold: true, gap: 4 });
  writeLines(`Submitted ${new Date(submission.created_at).toLocaleString()}`, { size: 9, gap: 12 });

  writeField("Name", submission.name);
  writeField("Email", submission.email);
  if (submission.phone) writeField("Phone", submission.phone);
  if (submission.message) writeField("Message", submission.message);

  const payload = submission.payload || {};
  const entries = Object.entries(payload).filter(([, value]) => humanizeValue(value) !== null);
  if (entries.length > 0) {
    ensureSpace(20);
    y += 4;
    writeLines("Application Details", { size: 12, bold: true, gap: 6 });
    for (const [key, value] of entries) {
      writeField(humanizeKey(key), humanizeValue(value) ?? "");
    }
  }

  const datePart = new Date(submission.created_at).toISOString().slice(0, 10);
  const safeName = submission.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  doc.save(`${submission.form_type}-${safeName}-${datePart}.pdf`);
}
