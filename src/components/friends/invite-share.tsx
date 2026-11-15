"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { Check, Copy, QrCode, RefreshCw, Share2 } from "lucide-react";
import { renewInviteLink } from "@/lib/friends/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const noopSubscribe = () => () => {};

/**
 * The member's personal invite link: copy, share (where the device supports it),
 * show as QR code to scan in person, or replace with a new one.
 */
export function InviteShare({ url, qrSvg }: { url: string; qrSvg: string }) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [confirmRenew, setConfirmRenew] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // The share sheet exists on phones and some browsers only; the server renders without it.
  const canShare = useSyncExternalStore(
    noopSubscribe,
    () => typeof navigator.share === "function",
    () => false,
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setMessage("Kopieren ging nicht – markiere den Link und kopiere ihn von Hand.");
    }
  }

  async function share() {
    try {
      await navigator.share({ title: "Bleibe", text: "Komm zu Bleibe – hier ist mein Einladungslink:", url });
    } catch {
      // Closing the share sheet is not an error.
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <label htmlFor="invite-url" className="sr-only">
          Dein Einladungslink
        </label>
        <Input id="invite-url" readOnly value={url} onFocus={(e) => e.currentTarget.select()} className="min-w-0 font-mono text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <Button onClick={copy} aria-live="polite">
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {copied ? "Kopiert!" : "Link kopieren"}
        </Button>
        {canShare ? (
          <Button variant="outline" onClick={share}>
            <Share2 aria-hidden="true" />
            Teilen
          </Button>
        ) : null}
        <Button variant="outline" onClick={() => setShowQr((v) => !v)} aria-expanded={showQr} aria-controls="invite-qr">
          <QrCode aria-hidden="true" />
          {showQr ? "QR-Code ausblenden" : "QR-Code zeigen"}
        </Button>
      </div>

      {showQr ? (
        <figure id="invite-qr" className="mx-auto w-full max-w-60 rounded-card bg-white p-4 shadow-soft">
          {/* Server-generated SVG from our own invite URL. */}
          <div className="[&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: qrSvg }} />
          <figcaption className="mt-2 text-center text-xs font-semibold text-[#2b2340]">Mit der Handy-Kamera scannen</figcaption>
        </figure>
      ) : null}

      <div className="border-t border-border pt-3">
        {confirmRenew ? (
          <div className="space-y-2">
            <p className="text-sm">Neuen Link erstellen? Der alte funktioniert danach nicht mehr.</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                loading={pending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await renewInviteLink();
                    setMessage(result.message ?? null);
                    setConfirmRenew(false);
                    setShowQr(false);
                  })
                }
              >
                Ja, neuer Link
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmRenew(false)} disabled={pending}>
                Abbrechen
              </Button>
            </div>
          </div>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setConfirmRenew(true)} className="-ml-2 text-muted-foreground">
            <RefreshCw aria-hidden="true" />
            Neuen Link erstellen
          </Button>
        )}
        {message ? (
          <p role="status" className="mt-2 text-xs text-muted-foreground">
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
