import type { KeyboardEvent } from "react";

/** Submits the surrounding form on Ctrl+Enter (Cmd+Enter on macOS). */
export function submitOnCtrlEnter(event: KeyboardEvent<HTMLTextAreaElement>) {
  if (event.key !== "Enter" || !(event.ctrlKey || event.metaKey)) return;
  event.preventDefault();
  event.currentTarget.form?.requestSubmit();
}
