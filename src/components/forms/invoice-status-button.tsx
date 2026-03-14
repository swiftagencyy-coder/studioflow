"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { toast } from "sonner";

import { updateInvoiceStatusAction } from "@/actions/studioflow";
import { Button } from "@/components/ui/button";
import type { TableRow } from "@/types/database";

export function InvoiceStatusButton({
  invoiceId,
  status
}: {
  invoiceId: string;
  status: TableRow<"invoices">["status"];
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  return (
    <Button
      disabled={isPending}
      size="sm"
      type="button"
      variant="outline"
      onClick={() => {
        setIsPending(true);
        startTransition(async () => {
          const result = await updateInvoiceStatusAction(invoiceId, status);
          setIsPending(false);

          if (!result.success) {
            toast.error(result.error ?? "Unable to update invoice.");
            return;
          }

          toast.success("Invoice updated.");
          router.refresh();
        });
      }}
    >
      Mark {status.replace(/_/g, " ")}
    </Button>
  );
}
