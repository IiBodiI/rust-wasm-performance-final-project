import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: ReactNode;
  isLoading?: boolean;
}

export function Button({
  children,
  className = "",
  variant = "primary",
  icon,
  isLoading,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`button button-${variant} ${className}`}
      disabled={disabled || isLoading}
      type={props.type ?? "button"}
      {...props}
    >
      {isLoading ? <span className="spinner" aria-hidden="true" /> : icon}
      <span>{children}</span>
    </button>
  );
}

