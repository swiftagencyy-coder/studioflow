"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

import { LogoMark } from "@/components/shared/logo-mark";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { appSidebarItems } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { LogoutForm } from "@/components/layout/logout-form";

export function AppShell({
  children,
  subtitle,
  userName
}: {
  children: React.ReactNode;
  subtitle?: string;
  userName: string;
}) {
  const currentPath = usePathname();

  return (
    <div className="sf-shell">
      <div className="sf-shellInner">
        <aside className="sf-card sf-sidebar">
          <LogoMark href="/dashboard" />
          <div className="sf-workspaceCard">
            <div className="sf-workspaceLabel">Workspace</div>
            <div className="sf-workspaceName">{subtitle ?? "Agency console"}</div>
          </div>
          <nav className="sf-nav">
            {appSidebarItems.map((item) => {
              const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href as Route}
                  className={cn(
                    "sf-navLink",
                    isActive && "sf-navLinkActive"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="sf-profilePanel">
            <div className="sf-profileRow">
              <Avatar>
                <AvatarFallback name={userName} />
              </Avatar>
              <div className="sf-profileMeta">
                <div className="sf-profileName">{userName}</div>
                <div className="sf-profileLabel">Agency workspace</div>
              </div>
              <ThemeToggle />
            </div>
            <LogoutForm />
          </div>
        </aside>
        <div className="sf-mainColumn">
          <header className="sf-card sf-mobileHeader">
            <LogoMark href="/dashboard" />
            <ThemeToggle />
          </header>
          <main className="space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
