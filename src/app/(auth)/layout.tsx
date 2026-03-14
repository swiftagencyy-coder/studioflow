import { Card, CardContent } from "@/components/ui/card";
import { LogoMark } from "@/components/shared/logo-mark";

export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen px-4 py-4 lg:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1400px] gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="hidden overflow-hidden lg:block">
          <CardContent className="flex h-full flex-col justify-between bg-gradient-to-br from-primary/10 via-background to-secondary/40 p-8">
            <LogoMark />
            <div className="space-y-5">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                StudioFlow
              </div>
              <h1 className="font-serif text-5xl font-semibold leading-tight">
                A cleaner way to manage client work end to end.
              </h1>
              <p className="max-w-lg text-base leading-8 text-muted-foreground">
                Build confidence with a polished portal that handles onboarding, files, proposals,
                approvals, revisions, and invoice visibility in one place.
              </p>
            </div>
          </CardContent>
        </Card>
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-xl">
            <CardContent className="space-y-8 p-8">
              <LogoMark className="lg:hidden" />
              {children}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
