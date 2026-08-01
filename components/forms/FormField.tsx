import { ReactNode } from "react";

export function FormField({
  label,
  htmlFor,
  required,
  children,
  error,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: ReactNode;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-brand-charcoal">
        {label}
        {required && (
          <span aria-hidden="true" className="text-brand-purple">
            {" "}
            *
          </span>
        )}
      </label>
      <div className="mt-1">{children}</div>
      {error && (
        <p role="alert" className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClasses =
  "block w-full rounded-md border border-brand-soft-blue bg-brand-white px-3 py-2 text-sm text-brand-charcoal shadow-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple";
