import type { LucideIcon } from "lucide-react";
import {
  BriefcaseBusiness,
  FolderKanban,
  LayoutDashboard,
  Users
} from "lucide-react";

export const projectStatusOptions = [
  { value: "lead", label: "Lead" },
  { value: "onboarding", label: "Onboarding" },
  { value: "in_progress", label: "In progress" },
  { value: "waiting_on_client", label: "Waiting on client" },
  { value: "review", label: "Review" },
  { value: "approved", label: "Approved" },
  { value: "completed", label: "Completed" }
] as const;

export const proposalStatusOptions = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" }
] as const;

export const invoiceStatusOptions = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" }
] as const;

export const approvalStatusOptions = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "changes_requested", label: "Changes requested" }
] as const;

export const revisionPriorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" }
] as const;

export const revisionStatusOptions = [
  { value: "open", label: "Open" },
  { value: "in_review", label: "In review" },
  { value: "in_progress", label: "In progress" },
  { value: "resolved", label: "Resolved" }
] as const;

export const fileCategoryOptions = [
  { value: "logo", label: "Logos" },
  { value: "brand_asset", label: "Brand assets" },
  { value: "document", label: "Documents" },
  { value: "deliverable", label: "Deliverables" },
  { value: "reference", label: "References" },
  { value: "onboarding_asset", label: "Onboarding assets" }
] as const;

export const serviceTypeOptions = [
  "Brand identity",
  "Website design",
  "Webflow build",
  "Landing page",
  "Marketing creative",
  "Pitch deck",
  "Retainer"
] as const;

export type SidebarItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

export const appSidebarItems: SidebarItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/clients", icon: Users, label: "Clients" },
  { href: "/projects", icon: FolderKanban, label: "Projects" },
  { href: "/portal", icon: BriefcaseBusiness, label: "Client portal" }
];

export const portalSidebarItems: SidebarItem[] = [
  { href: "/portal", icon: LayoutDashboard, label: "Overview" }
];
