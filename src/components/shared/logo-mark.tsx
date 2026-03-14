import Link from "next/link";
import type { Route } from "next";

import { cn } from "@/lib/utils";

export function LogoMark({ className, href = "/" }: { className?: string; href?: Route }) {
  return (
    <Link className={cn("inline-flex items-center gap-3", className)} href={href}>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-soft">
        SF
      </div>
      <div>
        <div className="font-serif text-xl font-semibold leading-none">StudioFlow</div>
        <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Client portal OS
        </div>
      </div>
    </Link>
  );
}
