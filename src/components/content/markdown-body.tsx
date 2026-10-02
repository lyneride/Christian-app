import { cn } from "@/lib/utils";

const styles =
  "space-y-3 leading-relaxed text-foreground/90 wrap-break-word [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6 [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:font-serif [&_blockquote]:text-foreground/80 [&_code]:rounded [&_code]:bg-surface-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.9em] [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-surface-muted [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:font-semibold [&_hr]:border-border";

/**
 * Renders HTML produced by `renderMarkdown()` (already sanitised) with the
 * app's typography. Hook-free, usable from server and client components.
 */
export function MarkdownBody({ html, className }: { html: string; className?: string }) {
  return <div className={cn(styles, className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
