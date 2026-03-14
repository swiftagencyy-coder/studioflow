import { LogOut } from "lucide-react";

import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function LogoutForm() {
  return (
    <form action={logoutAction}>
      <Button className="w-full justify-start" type="submit" variant="ghost">
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </form>
  );
}
