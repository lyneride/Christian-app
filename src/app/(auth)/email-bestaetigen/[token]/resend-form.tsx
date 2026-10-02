"use client";

import { useActionState } from "react";
import { resendVerification } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/auth/form-message";

export function ResendVerificationForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(resendVerification, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage state={state} />
      <p className="text-muted-foreground text-center text-sm">
        Wir schicken dir einen neuen Link an <span className="text-foreground font-medium">{email}</span>.
      </p>
      <Button type="submit" loading={pending} disabled={state?.ok} className="w-full" size="lg">
        Neuen Link anfordern
      </Button>
    </form>
  );
}
