"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/input";
import { initialActionState } from "@/lib/action-state";
import { updateNotifications } from "../actions";

export function NotificationsForm({ notifyByEmail }: { notifyByEmail: boolean }) {
  const [state, formAction, pending] = useActionState(updateNotifications, initialActionState);

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage state={state} />
      <label htmlFor="notifyByEmail" className="flex items-start gap-2.5 text-sm text-foreground">
        <Checkbox id="notifyByEmail" name="notifyByEmail" defaultChecked={notifyByEmail} className="mt-0.5" />
        <span>
          <span className="font-medium">E-Mails bei wichtigen Ereignissen</span>
          <span className="block text-xs text-muted-foreground">
            Zum Beispiel bei neuen Nachrichten, Antworten auf deine Beiträge oder Anfragen für eine Gebetspartnerschaft. Nie Werbung.
          </span>
        </span>
      </label>
      <div className="flex justify-end">
        <Button type="submit" variant="outline" loading={pending}>
          Speichern
        </Button>
      </div>
    </form>
  );
}
