import { cn } from "@/lib/utils";

const classes =
  "text-sm leading-relaxed text-foreground/90 [&_p+p]:mt-2 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_code]:rounded [&_code]:bg-surface-muted [&_code]:px-1 [&_strong]:font-semibold";

/** Renders HTML produced by `renderMarkdown()` (already sanitised) with readable defaults. */
export function MarkdownBody({ html, className }: { html: string; className?: string }) {
  return <div className={cn(classes, className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
