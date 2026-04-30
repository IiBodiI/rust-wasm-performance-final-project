import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  detail?: string;
  tone?: "neutral" | "success" | "danger" | "warning";
}

export function StatCard({ label, value, detail, tone = "neutral" }: StatCardProps) {
  return (
    <section className={`stat-card stat-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </section>
  );
}

