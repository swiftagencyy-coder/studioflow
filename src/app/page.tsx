import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  FolderKanban,
  MessageSquareMore,
  ShieldCheck
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoMark } from "@/components/shared/logo-mark";
import { getViewerContext, getViewerHomePath } from "@/lib/auth/context";

const highlights = [
  "Structured onboarding questionnaires",
  "Client-visible proposals and approvals",
  "Secure Supabase storage with RLS",
  "Invoices, revisions, and activity history"
];

export default async function HomePage() {
  const viewer = await getViewerContext();

  if (viewer) {
    redirect(getViewerHomePath(viewer));
  }

  return (
    <div className="sf-homeRoot">
      <div className="sf-homeInner space-y-6">
        <header className="sf-card sf-homeHeader">
          <LogoMark />
          <div className="sf-homeHeaderActions">
            <Button asChild variant="ghost">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </header>

        <section className="sf-card sf-homeHero">
          <div className="sf-homeGrid lg:items-center">
            <div className="sf-homeLead">
              <div className="space-y-4">
                <div className="sf-homeEyebrow">Premium client portal for creative teams</div>
                <h1 className="sf-homeTitle">
                  Run onboarding, approvals, revisions, and invoices from one calm workspace.
                </h1>
                <p className="sf-homeText">
                  StudioFlow replaces scattered email threads with a secure, client-friendly portal
                  built for freelancers, design studios, and agencies that want a more premium way
                  to work.
                </p>
              </div>
              <div className="sf-homeHighlights">
                {highlights.map((item) => (
                  <div key={item} className="sf-homeHighlight">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <div className="sf-homeActions">
                <Button asChild size="lg">
                  <Link href="/register">Create workspace</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/login">Explore demo-ready UI</Link>
                </Button>
              </div>
            </div>
            <div className="sf-homeRail">
              <Card className="bg-gradient-to-br from-primary/10 to-transparent">
                <CardHeader>
                  <CardTitle>Agency control</CardTitle>
                </CardHeader>
                <CardContent className="sf-homeFeatureStack text-sm text-muted-foreground">
                  <div className="sf-homeFeature">
                    <FolderKanban className="h-5 w-5 text-primary" />
                    Projects, files, and approvals stay mapped to the right client.
                  </div>
                  <div className="sf-homeFeature">
                    <MessageSquareMore className="h-5 w-5 text-primary" />
                    Revision requests stop getting buried in chat threads.
                  </div>
                  <div className="sf-homeFeature">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Supabase Auth, Postgres, Storage, and RLS secure every record.
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    What ships in the MVP
                  </div>
                  <div className="sf-homeMvpGrid mt-4">
                    <div className="sf-homeMvpCard">
                      <div className="font-semibold">Agency dashboard</div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Clients, projects, approvals, invoices, and recent activity.
                      </p>
                    </div>
                    <div className="sf-homeMvpCard">
                      <div className="font-semibold">Client portal</div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Onboarding forms, proposals, deliverables, approvals, revisions, and billing.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
