"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { MessageCircle } from "lucide-react";
import type { ReactionKind } from "@/generated/prisma/enums";
import { toggleReaction } from "@/app/(site)/gemeinschaft/actions";
import type { ReactionCounts } from "@/lib/community/queries";
import { REACTION_KINDS, REACTION_LABELS } from "@/lib/validation/community";
import { cn } from "@/lib/utils";

interface Props {
  postId: string;
  reactions: ReactionCounts;
  viewerReaction: ReactionKind | null;
  signedIn: boolean;
  commentCount: number;
  commentHref: string;
  /** Login target for guests (with return path). */
  loginHref: string;
}

interface Optimistic {
  reactions: ReactionCounts;
  mine: ReactionKind | null;
}

/** Applies a click locally: same kind again removes, another kind replaces. */
function applyToggle(state: Optimistic, kind: ReactionKind): Optimistic {
  const reactions = { ...state.reactions };
  if (state.mine) reactions[state.mine] = Math.max(0, reactions[state.mine] - 1);
  if (state.mine === kind) return { reactions, mine: null };
  reactions[kind] += 1;
  return { reactions, mine: kind };
}

const pill =
  "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/** Amen / Herz / Ich bete with counts, optimistic toggling, plus the comment count. */
export function ReactionBar({ postId, reactions, viewerReaction, signedIn, commentCount, commentHref, loginHref }: Props) {
  const [optimistic, setOptimistic] = useOptimistic<Optimistic, ReactionKind>({ reactions, mine: viewerReaction }, applyToggle);
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function react(kind: ReactionKind) {
    setError(null);
    startTransition(async () => {
      setOptimistic(kind);
      const result = await toggleReaction(postId, kind);
      if (!result.ok) setError(result.message ?? "Das hat leider nicht geklappt.");
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {REACTION_KINDS.map((kind) => {
        const { label, emoji, pressed } = REACTION_LABELS[kind];
        const count = optimistic.reactions[kind];
        const active = optimistic.mine === kind;
        const content = (
          <>
            <span aria-hidden="true">{emoji}</span>
            <span className="sr-only">{label}:</span>
            <span className="tabular-nums">{count}</span>
          </>
        );
        if (!signedIn) {
          return (
            <Link key={kind} href={loginHref} className={cn(pill, "border-border text-muted-foreground hover:bg-surface-muted")} title={`${label} – bitte anmelden`}>
              {content}
            </Link>
          );
        }
        return (
          <button
            key={kind}
            type="button"
            onClick={() => react(kind)}
            aria-pressed={active}
            title={active ? pressed : label}
            className={cn(
              pill,
              active
                ? "border-primary bg-primary-soft text-primary font-medium"
                : "border-border text-muted-foreground hover:bg-surface-muted hover:text-foreground",
            )}
          >
            {content}
          </button>
        );
      })}
      <Link href={commentHref} className={cn(pill, "border-border text-muted-foreground hover:bg-surface-muted hover:text-foreground")}>
        <MessageCircle className="size-4" aria-hidden="true" />
        <span className="tabular-nums">{commentCount}</span>
        <span className="sr-only">{commentCount === 1 ? "Kommentar" : "Kommentare"}</span>
      </Link>
      {error ? (
        <span role="alert" className="text-xs text-danger">
          {error}
        </span>
      ) : null}
    </div>
  );
}
