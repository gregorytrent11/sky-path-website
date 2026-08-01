export default function ExternalApplicationCta({
  url,
  label,
}: {
  url: string;
  label: string;
}) {
  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-full bg-brand-purple px-6 py-3 text-base font-semibold text-brand-white shadow-sm transition-colors hover:bg-brand-deep-blue"
      >
        {label}
      </a>
    );
  }

  return (
    <div className="rounded-lg border border-dashed border-brand-soft-blue bg-brand-gray/50 p-6 text-center">
      <p className="text-sm leading-relaxed text-brand-charcoal/80">
        Online applications are being configured. Please{" "}
        <a href="/contact" className="font-semibold text-brand-purple hover:underline">
          contact us
        </a>{" "}
        and we&rsquo;ll walk you through applying in the meantime.
      </p>
    </div>
  );
}
