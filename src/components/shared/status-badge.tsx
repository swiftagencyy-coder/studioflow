import { Badge } from "@/components/ui/badge";

export function StatusBadge({
  value
}: {
  value: string;
}) {
  const normalized = value.replace(/_/g, " ");
  const variant =
    value === "approved" || value === "accepted" || value === "paid" || value === "completed"
      ? "success"
      : value === "rejected" || value === "overdue"
        ? "danger"
        : value === "review" || value === "pending" || value === "sent"
          ? "warning"
          : "secondary";

  return <Badge variant={variant}>{normalized}</Badge>;
}
