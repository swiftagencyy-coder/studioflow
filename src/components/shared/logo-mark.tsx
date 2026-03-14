import Link from "next/link";
import type { Route } from "next";

import { cn } from "@/lib/utils";

export function LogoMark({ className, href = "/" }: { className?: string; href?: Route }) {
  return (
    <Link className={cn("sf-logo", className)} href={href}>
      <div className="sf-logoMark">
        SF
      </div>
      <div className="sf-logoBody">
        <div className="sf-logoTitle">StudioFlow</div>
        <div className="sf-logoCaption">Client portal OS</div>
      </div>
    </Link>
  );
}
