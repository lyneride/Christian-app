import { describe, expect, it } from "vitest";
import { z } from "zod";
import { addCommentSchema, editCommentSchema } from "./comment";

function fieldErrors(result: z.ZodSafeParseResult<unknown>) {
  if (result.success) throw new Error("expected a validation failure");
  return z.flattenError(result.error).fieldErrors as Record<string, string[] | undefined>;
}

describe("addCommentSchema", () => {
  it("accepts exactly one target and drops empty ids", () => {
    expect(addCommentSchema.parse({ prayerRequestId: "p1", postId: "", parentId: "", body: " Amen " })).toEqual({
      prayerRequestId: "p1",
      postId: undefined,
      parentId: undefined,
      body: "Amen",
    });
  });

  it("rejects missing or ambiguous targets", () => {
    expect(fieldErrors(addCommentSchema.safeParse({ body: "Hallo" })).body).toEqual([
      "Der Kommentar hat kein gültiges Ziel.",
    ]);
    expect(addCommentSchema.safeParse({ postId: "a", prayerRequestId: "b", body: "Hallo" }).success).toBe(false);
  });

  it("enforces 1 to 2000 characters", () => {
    expect(fieldErrors(addCommentSchema.safeParse({ postId: "a", body: "   " })).body).toEqual([
      "Bitte schreib etwas.",
    ]);
    expect(addCommentSchema.safeParse({ postId: "a", body: "x".repeat(2000) }).success).toBe(true);
    expect(addCommentSchema.safeParse({ postId: "a", body: "x".repeat(2001) }).success).toBe(false);
  });
});

describe("editCommentSchema", () => {
  it("requires the comment id", () => {
    expect(editCommentSchema.safeParse({ commentId: "", body: "x" }).success).toBe(false);
    expect(editCommentSchema.safeParse({ commentId: "c1", body: "x" }).success).toBe(true);
  });
});
