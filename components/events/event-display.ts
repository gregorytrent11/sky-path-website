export function formatEventDate(eventDate: string | null): string | null {
  if (!eventDate) return null;
  // event_date is a plain SQL date ("YYYY-MM-DD"); parsing it as UTC avoids
  // the browser's local timezone shifting it back a day near midnight.
  const date = new Date(`${eventDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
