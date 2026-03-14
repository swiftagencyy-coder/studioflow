import { Card, CardContent } from "@/components/ui/card";
import { LogoMark } from "@/components/shared/logo-mark";

export default function AuthLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="sf-authRoot">
      <div className="sf-authGrid">
        <Card className="sf-authShowcase">
          <CardContent className="sf-authShowcaseInner !p-0">
            <LogoMark />
            <div className="space-y-5">
              <div className="sf-authEyebrow">StudioFlow</div>
              <h1 className="sf-authTitle">A cleaner way to manage client work end to end.</h1>
              <p className="sf-authText">
                Build confidence with a polished portal that handles onboarding, files, proposals,
                approvals, revisions, and invoice visibility in one place.
              </p>
            </div>
          </CardContent>
        </Card>
        <div className="sf-authPanel">
          <Card className="sf-authPanelCard">
            <CardContent className="space-y-8 !p-0">
              <LogoMark className="lg:hidden" />
              {children}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
