import type { ReactNode } from "react";

interface AlertProps {
  children: ReactNode;
  variant?: "info" | "success" | "warning" | "danger";
}

export function Alert({ children, variant = "info" }: AlertProps) {
  return (
    <div className={`alert alert-${variant}`} role={variant === "danger" ? "alert" : "status"}>
      {children}
    </div>
  );
}

