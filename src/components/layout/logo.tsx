import Image from "next/image";
import { cn } from "@/lib/utils";

/** Bleibe logo mark: Rebi's face. Size it with a `size-*` class. */
export function Logo({ className }: { className?: string }) {
  return (
    <Image src="/rebi/face.svg" alt="" aria-hidden="true" width={40} height={40} unoptimized className={cn("shrink-0 object-contain", className)} />
  );
}
