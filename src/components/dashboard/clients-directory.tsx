"use client";

import { Search, Users } from "lucide-react";
import { useDeferredValue, useState } from "react";

import { ClientsTable } from "@/components/dashboard/clients-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
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

export function ClientsDirectory({
  data
}: {
  data: ClientRow[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const filtered = data.filter((client) => {
    const matchesStatus = status === "all" || client.status === status;
    const matchesQuery =
      !deferredQuery ||
      client.name.toLowerCase().includes(deferredQuery) ||
      client.email.toLowerCase().includes(deferredQuery) ||
      client.contact_name.toLowerCase().includes(deferredQuery) ||
      client.tags.some((tag) => tag.toLowerCase().includes(deferredQuery));

    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 p-6 pb-0 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search clients, contacts, email, or tags"
            value={query}
          />
        </div>
        <Select onValueChange={setStatus} value={status}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {filtered.length ? (
        <ClientsTable data={filtered} />
      ) : (
        <div className="p-6 pt-2">
          <EmptyState
            description="Try a different search or status filter to find the client record you need."
            icon={Users}
            title="No matching clients"
          />
        </div>
      )}
    </div>
  );
}
