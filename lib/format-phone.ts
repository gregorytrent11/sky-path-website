// Formats digits as a US phone number while typing: (555) 123-4567.
// Non-digit characters (parens, dashes, spaces) are stripped and reinserted
// at the right positions, so pasting an already-formatted number works too.
export function formatUsPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
