import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/helpers";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wide text-navy-muted"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full border bg-white px-3 py-2.5 text-sm text-navy placeholder:text-navy-muted outline-none transition-colors duration-100",
            error
              ? "border-red-400 focus:border-red-500"
              : "border-sage-mid focus:border-teal",
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
        {hint && !error && (
          <p className="text-xs text-navy-muted mt-0.5">{hint}</p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";
