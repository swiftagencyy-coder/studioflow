import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CheckCircle2, FolderKanban, MessageSquareMore, ShieldCheck } from "lucide-react";

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
    <div className="min-h-screen px-4 py-4 lg:px-6">
      <div className="mx-auto max-w-[1480px] space-y-6">
        <header className="panel-surface flex items-center justify-between p-4">
          <LogoMark />
          <div className="flex items-center gap-3">
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

        <section className="panel-surface overflow-hidden p-8 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  Premium client portal for creative teams
                </div>
                <h1 className="max-w-3xl font-serif text-5xl font-semibold leading-tight tracking-tight lg:text-7xl">
                  Run onboarding, approvals, revisions, and invoices from one calm workspace.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                  StudioFlow replaces scattered email threads with a secure, client-friendly portal
                  built for freelancers, design studios, and agencies that want a more premium way
                  to work.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {highlights.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-secondary/60 px-4 py-3">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/register">Create workspace</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/login">Explore demo-ready UI</Link>
                </Button>
              </div>
            </div>
            <div className="grid gap-4">
              <Card className="bg-gradient-to-br from-primary/10 to-transparent">
                <CardHeader>
                  <CardTitle>Agency control</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-3 rounded-2xl bg-background/80 p-4">
                    <FolderKanban className="h-5 w-5 text-primary" />
                    Projects, files, and approvals stay mapped to the right client.
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-background/80 p-4">
                    <MessageSquareMore className="h-5 w-5 text-primary" />
                    Revision requests stop getting buried in chat threads.
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl bg-background/80 p-4">
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
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-secondary/60 p-4">
                      <div className="font-semibold">Agency dashboard</div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Clients, projects, approvals, invoices, and recent activity.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-secondary/60 p-4">
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
