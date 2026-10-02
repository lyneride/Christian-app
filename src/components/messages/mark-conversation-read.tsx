"use client";

import { startTransition, useEffect } from "react";
import { markConversationRead } from "@/app/(site)/nachrichten/actions";

/**
 * Marks the conversation as read when the page is shown and again whenever a
 * newer message arrives while it stays open (the latest id changes).
 */
export function MarkConversationRead({ conversationId, latestMessageId }: { conversationId: string; latestMessageId: string | null }) {
  useEffect(() => {
    startTransition(() => {
      void markConversationRead(conversationId);
    });
  }, [conversationId, latestMessageId]);
  return null;
}
