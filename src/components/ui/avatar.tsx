import { cn, initials } from "@/lib/utils";

// Soft area colours with ink text: friendly and always readable.
const PALETTE = ["bg-area-heute-soft", "bg-area-bibel-soft", "bg-area-gebet-soft", "bg-area-gemeinschaft-soft", "bg-area-ich-soft"];

function colorFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = { xs: "size-6 text-[10px]", sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-14 text-base", xl: "size-24 text-2xl" };

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={cn("shrink-0 rounded-full object-cover", sizes[size], className)} />;
  }
  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-display font-black text-foreground uppercase select-none", sizes[size], colorFor(name), className)}
    >
      {initials(name) || "?"}
    </span>
  );
}
