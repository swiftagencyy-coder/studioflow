import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  description,
  icon: Icon,
  title,
  value,
  className
}: {
  className?: string;
  description: string;
  icon: LucideIcon;
  title: string;
  value: number | string;
}) {
  return (
    <Card className={cn("sf-statCard overflow-hidden", className)}>
      <CardContent>
        <div className="sf-statCopy">
          <div className="sf-statLabel">{title}</div>
          <div className="sf-statValue">{value}</div>
          <p className="sf-statDescription">{description}</p>
        </div>
        <div className="sf-statIcon">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
