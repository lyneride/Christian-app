import {
  Lightbulb,
  AtSign,
  Bell,
  CalendarDays,
  HandHeart,
  Handshake,
  Heart,
  MessageCircle,
  MessageSquare,
  Reply,
  ShieldAlert,
  Sparkles,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { NotificationType } from "@/lib/notifications";

export interface NotificationTypeInfo {
  icon: LucideIcon;
  /** Short German label used as fallback title and as the icon's accessible name. */
  label: string;
}

export const NOTIFICATION_TYPES: Record<NotificationType, NotificationTypeInfo> = {
  comment: { icon: MessageSquare, label: "Neuer Kommentar" },
  reply: { icon: Reply, label: "Neue Antwort" },
  reaction: { icon: Heart, label: "Reaktion" },
  prayer_support: { icon: HandHeart, label: "Jemand hat mitgebetet" },
  prayer_answered: { icon: Sparkles, label: "Gebet erhört" },
  group_request: { icon: Users, label: "Beitrittsanfrage" },
  group_accepted: { icon: Users, label: "In Gruppe aufgenommen" },
  partner_request: { icon: UserPlus, label: "Partneranfrage" },
  partner_accepted: { icon: Handshake, label: "Partnerschaft bestätigt" },
  event_reminder: { icon: CalendarDays, label: "Erinnerung an ein Treffen" },
  event_rsvp: { icon: CalendarDays, label: "Zusage zu deinem Treffen" },
  follow: { icon: UserPlus, label: "Neuer Follower" },
  friend_request: { icon: UserPlus, label: "Freundschaftsanfrage" },
  friend_accepted: { icon: Handshake, label: "Freundschaft bestätigt" },
  plan_invite: { icon: Users, label: "Einladung zum gemeinsamen Lesen" },
  plan_post: { icon: Lightbulb, label: "Impuls zum gemeinsamen Lesen" },
  message: { icon: MessageCircle, label: "Neue Nachricht" },
  mention: { icon: AtSign, label: "Erwähnung" },
  moderation: { icon: ShieldAlert, label: "Hinweis der Moderation" },
};

const FALLBACK: NotificationTypeInfo = { icon: Bell, label: "Benachrichtigung" };

/** Icon and label for a stored notification type (unknown types get a plain bell). */
export function notificationTypeInfo(type: string): NotificationTypeInfo {
  return (NOTIFICATION_TYPES as Record<string, NotificationTypeInfo | undefined>)[type] ?? FALLBACK;
}
