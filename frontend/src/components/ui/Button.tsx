import { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyle =
    "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary:
      "bg-brand-primary text-white hover:bg-brand-secondary focus:ring-brand-primary shadow-soft hover:shadow-modern",
    secondary:
      "bg-brand-secondary text-white hover:bg-brand-accent focus:ring-brand-secondary",
    outline:
      "border-2 border-brand-primary text-brand-primary hover:bg-brand-bgAlt focus:ring-brand-primary",
    ghost:
      "text-brand-textSecondary hover:bg-brand-surface hover:text-brand-primary focus:ring-brand-surface",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-8 py-3.5 text-lg",
  };

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${
        disabled || isLoading ? "opacity-60 cursor-not-allowed" : ""
      } ${className}`}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}