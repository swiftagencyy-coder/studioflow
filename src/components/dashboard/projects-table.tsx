"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";

type ProjectRow = {
  client: { name: string } | null;
  due_date: string | null;
  id: string;
  name: string;
  service_type: string;
  status: string;
};

const columns: ColumnDef<ProjectRow>[] = [
  {
    accessorKey: "name",
    cell: ({ row }) => (
      <div className="space-y-1">
        <Link className="font-semibold text-foreground hover:text-primary" href={`/projects/${row.original.id}`}>
          {row.original.name}
        </Link>
        <div className="text-sm text-muted-foreground">{row.original.client?.name ?? "Unassigned client"}</div>
      </div>
    ),
    header: "Project"
  },
  {
    accessorKey: "service_type",
    header: "Service"
  },
  {
    accessorKey: "due_date",
    cell: ({ row }) => formatDate(row.original.due_date),
    header: "Due date"
  },
  {
    accessorKey: "status",
    cell: ({ row }) => <StatusBadge value={row.original.status} />,
    header: "Status"
  }
];

export function ProjectsTable({ data }: { data: ProjectRow[] }) {
  return <DataTable columns={columns} data={data} />;
}
