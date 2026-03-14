"use client";

import { FolderKanban, Search } from "lucide-react";
import { useDeferredValue, useState } from "react";

import { ProjectsTable } from "@/components/dashboard/projects-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { projectStatusOptions } from "@/lib/constants";

type ProjectRow = {
  client: { name: string } | null;
  due_date: string | null;
  id: string;
  name: string;
  service_type: string;
  status: string;
};

export function ProjectsDirectory({
  data
}: {
  data: ProjectRow[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const filtered = data.filter((project) => {
    const matchesStatus = status === "all" || project.status === status;
    const matchesQuery =
      !deferredQuery ||
      project.name.toLowerCase().includes(deferredQuery) ||
      project.service_type.toLowerCase().includes(deferredQuery) ||
      (project.client?.name ?? "").toLowerCase().includes(deferredQuery);

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
            placeholder="Search projects, clients, or service type"
            value={query}
          />
        </div>
        <Select onValueChange={setStatus} value={status}>
          <SelectTrigger className="w-full md:w-[210px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {projectStatusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {filtered.length ? (
        <ProjectsTable data={filtered} />
      ) : (
        <div className="p-6 pt-2">
          <EmptyState
            description="Try a different search or project status filter to narrow the pipeline."
            icon={FolderKanban}
            title="No matching projects"
          />
        </div>
      )}
    </div>
  );
}
