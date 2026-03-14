import { cn } from "@/lib/utils";

export function PageHeader({
  actions,
  description,
  eyebrow,
  title,
  className
}: {
  actions?: React.ReactNode;
  className?: string;
  description?: string;
  eyebrow?: string;
  title: string;
}) {
  return (
    <div className={cn("sf-pageHeader", className)}>
      <div className="sf-pageHeaderText">
        {eyebrow ? <div className="sf-pageEyebrow">{eyebrow}</div> : null}
        <div className="space-y-2">
          <h1 className="sf-pageTitle text-foreground">{title}</h1>
          {description ? <p className="sf-pageDescription">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="sf-pageActions">{actions}</div> : null}
    </div>
  );
}
