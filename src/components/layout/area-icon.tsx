import { BookOpen, Heart, Sun, User, Users, type LucideProps } from "lucide-react";
import type { AreaIcon as AreaIconName } from "./areas";

const ICONS = { sun: Sun, book: BookOpen, heart: Heart, users: Users, user: User } as const;

export function AreaIcon({ name, ...props }: { name: AreaIconName } & LucideProps) {
  const Icon = ICONS[name];
  return <Icon aria-hidden="true" {...props} />;
}
