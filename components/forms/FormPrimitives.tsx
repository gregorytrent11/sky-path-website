import { inputClasses } from "@/components/forms/FormField";
import { formatUsPhone } from "@/lib/format-phone";

function Label({ label, required }: { label: string; required?: boolean }) {
  return (
    <span className="block text-sm font-medium text-brand-charcoal">
      {label}
      {required && (
        <span aria-hidden="true" className="text-brand-purple">
          {" "}
          *
        </span>
      )}
    </span>
  );
}

export function TextField({
  id,
  label,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
  min,
  max,
  describedBy,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  describedBy?: string;
}) {
  return (
    <div>
      <label htmlFor={id}>
        <Label label={label} required={required} />
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        min={min}
        max={max}
        aria-describedby={describedBy}
        className={`mt-1 ${inputClasses}`}
      />
    </div>
  );
}

const PHONE_PATTERN = "\\(\\d{3}\\) \\d{3}-\\d{4}";
// Accepts N/A, n/a, NA -- what people actually type when a phone number
// doesn't apply to them.
const NA_PATTERN = "[Nn]/?[Aa]";

export function PhoneField({
  id,
  label,
  value,
  onChange,
  required,
  allowNA,
  describedBy,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  allowNA?: boolean;
  describedBy?: string;
}) {
  return (
    <div>
      <label htmlFor={id}>
        <Label label={label} required={required} />
      </label>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={value}
        // formatUsPhone strips every non-digit, so on an allowNA field it
        // would silently eat "N/A" as the applicant typed it. Letters mean
        // they're not entering a number, so pass the text straight through.
        onChange={(e) => {
          const raw = e.target.value;
          onChange(allowNA && /[a-zA-Z]/.test(raw) ? raw : formatUsPhone(raw));
        }}
        required={required}
        placeholder={allowNA ? "(555) 123-4567 or N/A" : "(555) 123-4567"}
        pattern={allowNA ? `(${PHONE_PATTERN})|(${NA_PATTERN})` : PHONE_PATTERN}
        title={
          allowNA
            ? "Phone number in the format (555) 123-4567, or N/A"
            : "Phone number in the format (555) 123-4567"
        }
        maxLength={14}
        aria-describedby={describedBy}
        className={`mt-1 ${inputClasses}`}
      />
    </div>
  );
}

export function TextAreaField({
  id,
  label,
  value,
  onChange,
  required,
  rows = 3,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id}>
        <Label label={label} required={required} />
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className={`mt-1 ${inputClasses}`}
      />
    </div>
  );
}

export function RadioGroupField({
  name,
  label,
  value,
  onChange,
  options,
  required,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
}) {
  return (
    <fieldset>
      <Label label={label} required={required} />
      <div className="mt-2 flex flex-wrap gap-4">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm text-brand-charcoal">
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={(e) => onChange(e.target.value)}
              required={required}
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function YesNoField({
  name,
  label,
  value,
  onChange,
  required,
  options = ["Yes", "No"],
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  options?: string[];
}) {
  return (
    <RadioGroupField name={name} label={label} value={value} onChange={onChange} options={options} required={required} />
  );
}

export function CheckboxGroupField({
  label,
  values,
  onChange,
  options,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: string[];
}) {
  function toggle(option: string) {
    onChange(values.includes(option) ? values.filter((v) => v !== option) : [...values, option]);
  }
  return (
    <fieldset>
      <Label label={label} />
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-2 text-sm text-brand-charcoal">
            <input type="checkbox" checked={values.includes(option)} onChange={() => toggle(option)} />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b border-brand-soft-blue/60 pb-2 font-heading text-xl font-semibold text-brand-deep-blue">
      {children}
    </h2>
  );
}
