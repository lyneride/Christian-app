"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { acceptInvite } from "@/lib/friends/actions";
import { Button, buttonClasses } from "@/components/ui/button";

/** Confirms an invite link: the viewer and the inviter become friends. */
export function AcceptInviteButton({ code, inviterUsername }: { code: string; inviterUsername: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message?: string } | null>(null);

  if (result?.ok) {
    return (
      <div className="space-y-4" role="status">
        <p className="font-display text-lg font-extrabold text-success">{result.message}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href={`/@${inviterUsername}`} className={buttonClasses("primary", "md")}>
            Profil ansehen
          </Link>
          <Link href="/freunde" className={buttonClasses("outline", "md")}>
            Zu deinen Freunden
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Button
        size="lg"
        loading={pending}
        className="w-full sm:w-auto"
        onClick={() =>
          startTransition(async () => {
            const r = await acceptInvite(code);
            setResult({ ok: Boolean(r.ok), message: r.message });
          })
        }
      >
        {pending ? null : <Heart aria-hidden="true" />}
        Freund werden
      </Button>
      {result && !result.ok ? (
        <p role="alert" className="text-sm font-medium text-danger">
          {result.message}
        </p>
      ) : null}
    </div>
  );
}
