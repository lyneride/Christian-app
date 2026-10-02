"use client";

import { useId, useState, useTransition } from "react";
import { Ban, Check, UserMinus, X } from "lucide-react";
import type { GroupRole } from "@/generated/prisma/enums";
import { approveMember, banMember, changeRole, rejectMember, removeMember } from "@/app/(site)/gruppen/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { UserLink } from "@/components/profile/user-link";
import type { MemberRowData } from "@/lib/groups/queries";
import { canActOn, canChangeRole, type MembershipLike } from "@/lib/groups/roles";
import { formatDate } from "@/lib/utils";
import { GROUP_ROLES, GROUP_ROLE_LABELS } from "@/lib/validation/groups";

interface Props {
  groupId: string;
  member: MemberRowData;
  /** The viewer's own membership (decides which controls show). */
  actor: MembershipLike | null;
  isSelf: boolean;
  /** Show management controls at all (member list vs. management page). */
  manage?: boolean;
}

/** One member with role badge, join date and – for the leadership – approve/remove/ban/role controls. */
export function MemberRow({ groupId, member, actor, isSelf, manage = false }: Props) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const selectId = useId();
  const userId = member.user.id;

  function run(action: () => Promise<{ ok?: boolean; message?: string }>) {
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      if (result.message) setMessage({ ok: !!result.ok, text: result.message });
    });
  }

  const pendingRequest = member.status === "PENDING";
  const banned = member.status === "BANNED";
  const showActions = manage && !isSelf && canActOn(actor, member);
  const showRole = manage && !isSelf && canChangeRole(actor, member);

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <UserLink user={member.user} size="sm" />
        {member.status === "ACTIVE" && member.role !== "MEMBER" ? (
          <Badge variant={member.role === "OWNER" ? "accent" : "primary"}>{GROUP_ROLE_LABELS[member.role]}</Badge>
        ) : null}
        {banned ? <Badge variant="danger">Gesperrt</Badge> : null}
        {isSelf ? <span className="text-xs text-muted-foreground">(du)</span> : null}
      </div>
      <span className="text-xs text-muted-foreground">
        {pendingRequest ? "angefragt am " : "dabei seit "}
        <time dateTime={member.joinedAt.toISOString()}>{formatDate(member.joinedAt, "d. MMM yyyy")}</time>
      </span>

      {showRole ? (
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="sr-only" id={`${selectId}-label`}>
            Rolle von {member.user.name}
          </span>
          <Select
            id={selectId}
            aria-labelledby={`${selectId}-label`}
            value={member.role}
            disabled={pending}
            className="h-8 w-auto py-0 text-xs"
            onChange={(e) => {
              const role = e.target.value as GroupRole;
              if (role === "OWNER" && !window.confirm(`Die Leitung an ${member.user.name} übergeben? Du bleibst in der Mitleitung.`)) {
                e.target.value = member.role;
                return;
              }
              run(() => changeRole(groupId, userId, role));
            }}
          >
            {GROUP_ROLES.map((r) => (
              <option key={r} value={r}>
                {r === "OWNER" ? "Leitung übergeben" : GROUP_ROLE_LABELS[r]}
              </option>
            ))}
          </Select>
        </label>
      ) : null}

      {showActions ? (
        <div className="flex flex-wrap items-center gap-1">
          {pendingRequest ? (
            <>
              <Button type="button" size="sm" onClick={() => run(() => approveMember(groupId, userId))} loading={pending}>
                <Check aria-hidden="true" /> Annehmen
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => run(() => rejectMember(groupId, userId))} disabled={pending}>
                <X aria-hidden="true" /> Ablehnen
              </Button>
            </>
          ) : banned ? (
            <Button type="button" size="sm" variant="outline" onClick={() => run(() => removeMember(groupId, userId))} disabled={pending}>
              Sperre aufheben
            </Button>
          ) : (
            <>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (window.confirm(`${member.user.name} aus der Gruppe entfernen?`)) run(() => removeMember(groupId, userId));
                }}
                disabled={pending}
              >
                <UserMinus aria-hidden="true" /> Entfernen
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-danger hover:bg-danger-soft"
                onClick={() => {
                  if (window.confirm(`${member.user.name} sperren? Die Person kann der Gruppe dann nicht mehr beitreten.`)) run(() => banMember(groupId, userId));
                }}
                disabled={pending}
              >
                <Ban aria-hidden="true" /> Sperren
              </Button>
            </>
          )}
        </div>
      ) : null}

      {message ? (
        <span role={message.ok ? "status" : "alert"} className={message.ok ? "basis-full text-xs text-success" : "basis-full text-xs text-danger"}>
          {message.text}
        </span>
      ) : null}
    </li>
  );
}
