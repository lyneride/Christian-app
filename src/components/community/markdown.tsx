import { cn } from "@/lib/utils";

const classes =
  "leading-relaxed text-foreground/90 [&_p+p]:mt-3 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:my-2 [&_ol]:my-2 [&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_code]:rounded [&_code]:bg-surface-muted [&_code]:px-1 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-surface-muted [&_pre]:p-3 [&_strong]:font-semibold [&_hr]:my-4 [&_hr]:border-border";

/** Renders HTML produced by `renderMarkdown()` (already sanitised) with readable defaults. */
export function Markdown({ html, className }: { html: string; className?: string }) {
  return <div className={cn(classes, className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
