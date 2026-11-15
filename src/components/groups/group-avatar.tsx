import { initials, cn } from "@/lib/utils";

const sizes = {
  sm: "size-10 rounded-xl text-sm",
  md: "size-14 rounded-2xl text-lg",
  lg: "size-20 rounded-3xl text-2xl sm:size-24 sm:text-3xl",
} as const;

/** Picture of a group (square with rounded corners, so it is told apart from people); initials without one. */
export function GroupAvatar({ name, src, size = "md", className }: { name: string; src?: string | null; size?: keyof typeof sizes; className?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={cn("bg-surface-muted shrink-0 object-cover", sizes[size], className)} />;
  }
  return (
    <span
      aria-hidden="true"
      className={cn(
        "bg-area-gemeinschaft-soft text-area-gemeinschaft font-display inline-flex shrink-0 items-center justify-center font-black uppercase select-none",
        sizes[size],
        className,
      )}
    >
      {initials(name) || "?"}
    </span>
  );
}
