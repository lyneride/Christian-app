import type { NextRequest } from "next/server";

/** Serves profile pictures stored as private blobs in Vercel Blob. */
export async function GET(_req: NextRequest, ctx: RouteContext<"/api/avatar/[file]">) {
  const { file } = await ctx.params;
  if (!/^[a-z0-9]+-[a-f0-9]{12}\.webp$/.test(file)) return new Response("Not found", { status: 404 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return new Response("Not found", { status: 404 });
  const { get } = await import("@vercel/blob");
  const result = await get(`avatars/${file}`, { access: "private" }).catch(() => null);
  if (!result || !result.stream) return new Response("Not found", { status: 404 });
  return new Response(result.stream, {
    headers: {
      "Content-Type": "image/webp",
      // the file name contains a content hash, so it can be cached for a long time
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
