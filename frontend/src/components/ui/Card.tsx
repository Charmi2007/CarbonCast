import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({
  children,
  className = "",
  hoverable = false,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={`bg-brand-bg rounded-2xl shadow-soft border border-brand-border p-6 transition-shadow duration-300 ${
        hoverable ? "hover:shadow-modern cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}