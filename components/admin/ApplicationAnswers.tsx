import type { ResolvedField, ResolvedSection } from "@/lib/application-layouts";

const GRID_COLUMNS = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-3",
} as const;

function Mark({ on, square }: { on: boolean; square?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center border ${
        square ? "rounded-sm" : "rounded-full"
      } ${on ? "border-brand-purple" : "border-brand-charcoal/40"} bg-brand-white`}
    >
      {on &&
        (square ? (
          <svg viewBox="0 0 12 12" className="h-3 w-3 text-brand-purple">
            <path d="M2.5 6.2 5 8.6l4.5-5.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-brand-purple" />
        ))}
    </span>
  );
}

function Answer({ field }: { field: ResolvedField }) {
  if (field.agreement) {
    return (
      <div>
        <dt className="sr-only">{field.checked ? "Agreed" : "Not agreed"}</dt>
        <dd className="flex items-start gap-2 text-brand-charcoal">
          <span className="mt-0.5">
            <Mark on={field.checked === true} square />
          </span>
          {field.label}
        </dd>
      </div>
    );
  }

  return (
    <div>
      <dt className="font-medium text-brand-charcoal">{field.label}</dt>
      <dd className="mt-1">
        {field.options ? (
          <ul
            className={
              field.multiple ? "grid grid-cols-1 gap-1 sm:grid-cols-2" : "flex flex-wrap gap-x-4 gap-y-1"
            }
          >
            {field.options.map((option) => {
              const on = field.selected.includes(option);
              return (
                <li
                  key={option}
                  className={`flex items-center gap-2 ${
                    on ? "font-semibold text-brand-charcoal" : "text-brand-charcoal/60"
                  }`}
                >
                  <Mark on={on} square={field.multiple} />
                  {option}
                  {on && <span className="sr-only"> (selected)</span>}
                </li>
              );
            })}
          </ul>
        ) : (
          <p
            className={`min-h-9 whitespace-pre-line break-words rounded-md border border-brand-soft-blue/70 bg-brand-gray px-3 py-2 ${
              field.value === null ? "italic text-brand-charcoal/60" : "text-brand-charcoal"
            }`}
          >
            {field.value === null ? (
              "Not answered"
            ) : field.key === "email" ? (
              <a href={`mailto:${field.value}`} className="text-brand-purple hover:underline">
                {field.value}
              </a>
            ) : (
              field.value
            )}
          </p>
        )}
      </dd>
    </div>
  );
}

// An application laid out the way the applicant saw the form -- same
// sections, question wording and side-by-side fields. The PDF export draws
// from the same `layoutApplication()` result, so the two stay in step.
export default function ApplicationAnswers({ sections }: { sections: ResolvedSection[] }) {
  return (
    <div className="space-y-6">
      {sections.map((section) =>
        section.rows.length === 0 ? null : (
          <section key={section.title} className="space-y-3">
            <h3 className="border-b border-brand-soft-blue/60 pb-1 font-heading text-base font-semibold text-brand-deep-blue">
              {section.title}
            </h3>
            {section.rows.map((row, i) =>
              row.kind === "subheading" ? (
                <h4 key={i} className="pt-1 font-heading text-sm font-semibold text-brand-deep-blue">
                  {row.text}
                </h4>
              ) : row.kind === "note" ? (
                <p key={i} className="text-brand-charcoal/70">
                  {row.text}
                </p>
              ) : (
                <dl key={i} className={`grid gap-x-4 gap-y-3 ${GRID_COLUMNS[row.columns]}`}>
                  {row.fields.map((field) => (
                    <Answer key={field.key} field={field} />
                  ))}
                </dl>
              )
            )}
          </section>
        )
      )}
    </div>
  );
}
