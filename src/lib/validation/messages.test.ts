import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  MESSAGE_MAX,
  conversationIdSchema,
  messageBodySchema,
  recipientUsernameSchema,
  sendMessageSchema,
  startConversationSchema,
  startGroupChatSchema,
  GROUP_CHAT_MAX_MEMBERS,
} from "./messages";

function fieldErrors(result: z.ZodSafeParseResult<unknown>) {
  if (result.success) throw new Error("expected a validation failure");
  return z.flattenError(result.error).fieldErrors as Record<string, string[] | undefined>;
}

describe("messageBodySchema", () => {
  it("trims, keeps inner line breaks and normalises CRLF", () => {
    expect(messageBodySchema.parse("  Hallo Maria,\r\nwie geht es dir?  \n")).toBe("Hallo Maria,\nwie geht es dir?");
  });

  it("collapses more than one blank line", () => {
    expect(messageBodySchema.parse("a\n\n\n\nb")).toBe("a\n\nb");
    expect(messageBodySchema.parse("a\n\nb")).toBe("a\n\nb");
  });

  it("enforces 1 to 4000 characters with German messages", () => {
    const empty = messageBodySchema.safeParse("   \n ");
    expect(empty.success).toBe(false);
    if (!empty.success) expect(empty.error.issues[0]?.message).toBe("Bitte schreib eine Nachricht.");
    expect(messageBodySchema.safeParse("x".repeat(MESSAGE_MAX)).success).toBe(true);
    const long = messageBodySchema.safeParse("x".repeat(MESSAGE_MAX + 1));
    expect(long.success).toBe(false);
    if (!long.success) expect(long.error.issues[0]?.message).toBe("Eine Nachricht darf höchstens 4000 Zeichen lang sein.");
  });

  it("rejects non-strings", () => {
    expect(messageBodySchema.safeParse(42).success).toBe(false);
    expect(messageBodySchema.safeParse(undefined).success).toBe(false);
  });
});

describe("recipientUsernameSchema", () => {
  it("strips a leading @, trims and lower-cases", () => {
    expect(recipientUsernameSchema.parse("  @Maria_M ")).toBe("maria_m");
    expect(recipientUsernameSchema.parse("maria.m-2")).toBe("maria.m-2");
  });

  it("enforces 3 to 30 characters and the allowed characters", () => {
    expect(recipientUsernameSchema.safeParse("ab").success).toBe(false);
    expect(recipientUsernameSchema.safeParse("@").success).toBe(false);
    expect(recipientUsernameSchema.safeParse("a".repeat(30)).success).toBe(true);
    expect(recipientUsernameSchema.safeParse("a".repeat(31)).success).toBe(false);
    for (const bad of ["maria m", "märia", "ma/ria", "<b>"]) {
      expect(recipientUsernameSchema.safeParse(bad).success, bad).toBe(false);
    }
  });
});

describe("startConversationSchema", () => {
  it("validates recipient and body together", () => {
    expect(startConversationSchema.parse({ username: "@Anna", body: " Hallo! " })).toEqual({ username: "anna", body: "Hallo!" });
  });

  it("reports both fields at once", () => {
    const errors = fieldErrors(startConversationSchema.safeParse({ username: "", body: "" }));
    expect(errors.username).toEqual(["Bitte gib einen Benutzernamen mit mindestens 3 Zeichen an."]);
    expect(errors.body).toEqual(["Bitte schreib eine Nachricht."]);
  });
});

describe("sendMessageSchema / conversationIdSchema", () => {
  it("accepts a body and a non-empty id", () => {
    expect(sendMessageSchema.parse({ body: "Joh 3,16 ist mein Lieblingsvers." }).body).toBe("Joh 3,16 ist mein Lieblingsvers.");
    expect(conversationIdSchema.safeParse("").success).toBe(false);
    expect(conversationIdSchema.safeParse("c".repeat(65)).success).toBe(false);
    expect(conversationIdSchema.safeParse("clx123").success).toBe(true);
  });
});

describe("startGroupChatSchema", () => {
  it("accepts a title, friends and a first message and removes duplicate ids", () => {
    const parsed = startGroupChatSchema.parse({ title: "  Hauskreis  ", memberIds: ["a1", "b2", "a1"], body: "Hallo!" });
    expect(parsed).toEqual({ title: "Hauskreis", memberIds: ["a1", "b2"], body: "Hallo!" });
  });

  it("needs a name and at least one person", () => {
    const errors = fieldErrors(startGroupChatSchema.safeParse({ title: "x", memberIds: [], body: "Hallo" }));
    expect(errors.title?.[0]).toMatch(/mindestens 2 Zeichen/);
    expect(errors.memberIds?.[0]).toBe("Wähle mindestens einen Freund aus.");
  });

  it("caps the number of people", () => {
    const ids = Array.from({ length: GROUP_CHAT_MAX_MEMBERS + 1 }, (_, i) => `u${i}`);
    const errors = fieldErrors(startGroupChatSchema.safeParse({ title: "Groß", memberIds: ids, body: "Hallo" }));
    expect(errors.memberIds?.[0]).toMatch(/Höchstens/);
  });
});
