import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/helpers";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "cta" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: "bg-teal text-white active:opacity-80",
  cta: "bg-orange text-white active:opacity-80",
  secondary: "bg-white text-navy border border-sage-mid active:opacity-70",
  ghost: "text-teal active:opacity-60",
  destructive: "text-red-500 active:opacity-60",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-4 text-xs",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-6 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition-opacity duration-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
