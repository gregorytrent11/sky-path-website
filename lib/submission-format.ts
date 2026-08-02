// Turns a payload key like "preferredContact" or "transportation_access"
// into "Preferred Contact" / "Transportation Access" for display.
export function humanizeKey(key: string): string {
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .trim()
    .split(/\s+/);
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

export function humanizeValue(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) {
    const items = value.filter((item) => item !== null && item !== undefined && item !== "");
    return items.length > 0 ? items.join(", ") : null;
  }
  return String(value);
}
