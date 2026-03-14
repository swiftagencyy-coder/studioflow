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
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-6 px-4 py-4 lg:flex-row lg:px-6">
        <aside className="panel-surface flex w-full flex-col gap-6 p-4 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-[280px]">
          <LogoMark href="/dashboard" />
          <div className="rounded-3xl bg-secondary/60 p-4">
            <div className="text-sm text-muted-foreground">Workspace</div>
            <div className="mt-1 text-lg font-semibold">{subtitle ?? "Agency console"}</div>
          </div>
          <nav className="grid gap-2">
            {appSidebarItems.map((item) => {
              const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href as Route}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto space-y-3 rounded-3xl border border-border/80 bg-background/80 p-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback name={userName} />
              </Avatar>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{userName}</div>
                <div className="text-xs text-muted-foreground">Agency workspace</div>
              </div>
              <ThemeToggle />
            </div>
            <LogoutForm />
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="panel-surface flex flex-wrap items-center justify-between gap-4 p-4 lg:hidden">
            <LogoMark href="/dashboard" />
            <ThemeToggle />
          </header>
          <main className="space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
