"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { initialActionState } from "@/lib/action-state";
import { removeAvatar, uploadAvatar } from "@/app/(site)/einstellungen/avatar-actions";
import { AvatarCropper } from "./avatar-cropper";

export function AvatarUpload({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const [current, setCurrent] = useState<string | null>(avatarUrl);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function upload(blob: Blob) {
    setFile(null);
    start(async () => {
      const fd = new FormData();
      fd.set("avatar", new File([blob], "avatar.jpg", { type: "image/jpeg" }));
      const res = await uploadAvatar(initialActionState, fd);
      setMessage({ ok: Boolean(res.ok), text: res.message ?? "" });
      if (res.ok && typeof res.data?.url === "string") setCurrent(`${res.data.url as string}${res.data.url.toString().includes("?") ? "&" : "?"}v=${Date.now()}`);
    });
  }

  function remove() {
    start(async () => {
      const res = await removeAvatar();
      setMessage({ ok: Boolean(res.ok), text: res.message ?? "" });
      if (res.ok) setCurrent(null);
    });
  }

  return (
    <section className="rounded-card border border-border bg-surface p-5 shadow-soft" aria-labelledby="profilbild">
      <h2 id="profilbild" className="font-semibold">
        Profilbild
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Beliebige Größe, auch große Handyfotos. Du wählst den Ausschnitt selbst; das Bild wird vor dem Hochladen verkleinert.
      </p>

      {file ? (
        <div className="mt-4">
          <AvatarCropper file={file} onCancel={() => setFile(null)} onConfirm={upload} />
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Avatar name={name} src={current} size="xl" />
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              id="avatar"
              name="avatar"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.currentTarget.files?.[0];
                if (f) {
                  setMessage(null);
                  setFile(f);
                }
                e.currentTarget.value = "";
              }}
            />
            <Button type="button" variant="outline" loading={pending} onClick={() => inputRef.current?.click()}>
              <Camera aria-hidden="true" /> Bild auswählen
            </Button>
            {current ? (
              <Button type="button" variant="ghost" loading={pending} onClick={remove}>
                <Trash2 aria-hidden="true" /> Entfernen
              </Button>
            ) : null}
          </div>
        </div>
      )}

      {message ? (
        <p role="status" className={`mt-3 text-sm ${message.ok ? "text-success" : "text-danger"}`}>
          {message.text}
        </p>
      ) : null}
    </section>
  );
}
