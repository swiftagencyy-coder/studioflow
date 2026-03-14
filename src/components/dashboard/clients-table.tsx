"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";

type ClientRow = {
  activeProjectCount: number;
  contact_name: string;
  email: string;
  id: string;
  name: string;
  projectCount: number;
  status: string;
  tags: string[];
};

const columns: ColumnDef<ClientRow>[] = [
  {
    accessorKey: "name",
    cell: ({ row }) => (
      <div className="space-y-1">
        <Link className="font-semibold text-foreground hover:text-primary" href={`/clients/${row.original.id}`}>
          {row.original.name}
        </Link>
        <div className="text-sm text-muted-foreground">{row.original.contact_name}</div>
      </div>
    ),
    header: "Client"
  },
  {
    accessorKey: "email",
    header: "Email"
  },
  {
    accessorKey: "projectCount",
    cell: ({ row }) => `${row.original.activeProjectCount} active / ${row.original.projectCount} total`,
    header: "Projects"
  },
  {
    accessorKey: "tags",
    cell: ({ row }) => row.original.tags.join(", ") || "No tags",
    header: "Tags"
  },
  {
    accessorKey: "status",
    cell: ({ row }) => <StatusBadge value={row.original.status} />,
    header: "Status"
  }
];

export function ClientsTable({ data }: { data: ClientRow[] }) {
  return <DataTable columns={columns} data={data} />;
}
