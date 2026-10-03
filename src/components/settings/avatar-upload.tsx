"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { Camera, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { initialActionState } from "@/lib/action-state";
import { removeAvatar, uploadAvatar } from "@/app/(site)/einstellungen/avatar-actions";

export function AvatarUpload({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const [state, action, pending] = useActionState(uploadAvatar, initialActionState);
  const [removing, startRemove] = useTransition();
  const [removed, setRemoved] = useState(false);
  const [removeMessage, setRemoveMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploaded = state.ok && typeof state.data?.url === "string" ? (state.data.url as string) : null;
  const current = removed ? null : (uploaded ?? avatarUrl);

  return (
    <section className="rounded-card border border-border bg-surface p-5 shadow-soft" aria-labelledby="profilbild">
      <h2 id="profilbild" className="font-semibold">
        Profilbild
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">JPG, PNG oder WebP bis 5 MB. Wird auf 256 × 256 Pixel zugeschnitten.</p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <Avatar name={name} src={current} size="xl" />
        <form action={action} className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            id="avatar"
            name="avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(e) => {
              if (e.currentTarget.files?.length) e.currentTarget.form?.requestSubmit();
            }}
          />
          <Button type="button" variant="outline" loading={pending} onClick={() => inputRef.current?.click()}>
            <Camera aria-hidden="true" /> Bild auswählen
          </Button>
          {current ? (
            <Button
              type="button"
              variant="ghost"
              loading={removing}
              onClick={() =>
                startRemove(async () => {
                  const res = await removeAvatar();
                  setRemoveMessage(res.message ?? null);
                  if (res.ok) setRemoved(true);
                })
              }
            >
              <Trash2 aria-hidden="true" /> Entfernen
            </Button>
          ) : null}
        </form>
      </div>
      {state.message || removeMessage ? (
        <p role="status" className={`mt-3 text-sm ${state.ok === false ? "text-danger" : "text-success"}`}>
          {removeMessage ?? state.message}
        </p>
      ) : null}
    </section>
  );
}
