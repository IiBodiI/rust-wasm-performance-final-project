import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface DemoCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  badge?: string;
}

export function DemoCard({ icon: Icon, title, description, href, badge }: DemoCardProps) {
  return (
    <article className="demo-card">
      <div className="demo-card-header">
        <span className="icon-badge" aria-hidden="true">
          <Icon size={20} />
        </span>
        {badge ? <span className="badge">{badge}</span> : null}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <Link className="card-link" to={href}>
        Open <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </article>
  );
}

