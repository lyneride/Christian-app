import "server-only";
import { createHash } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Profile picture storage. On Vercel (BLOB_READ_WRITE_TOKEN set) images go to
 * Vercel Blob (public URL); otherwise they are written to public/uploads/avatars
 * and served by Next.js from /uploads/avatars/… (fine for a single server).
 * Every image is re-encoded to a 256×256 WebP, which also strips metadata.
 */

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];
const SIZE = 320;

export class AvatarError extends Error {}

async function toWebp(input: Buffer): Promise<Buffer> {
  try {
    // loaded lazily so a missing native binary only affects uploads, never page rendering
    const sharp = (await import("sharp")).default;
    return await sharp(input, { failOn: "none", animated: false })
      .rotate()
      .resize(SIZE, SIZE, { fit: "cover", position: "attention" })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    throw new AvatarError("Das Bild konnte nicht gelesen werden. Bitte ein JPG, PNG oder WebP wählen.");
  }
}

/** Token of the connected Vercel Blob store; also found when the store was connected with a custom prefix. */
export function blobToken(): string | undefined {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  const entry = Object.entries(process.env).find(([key, value]) => key.endsWith("BLOB_READ_WRITE_TOKEN") && value);
  return entry?.[1];
}

function usesBlob(): boolean {
  return Boolean(blobToken());
}

export async function storeAvatar(userId: string, file: File): Promise<string> {
  if (!file || file.size === 0) throw new AvatarError("Bitte eine Bilddatei auswählen.");
  if (file.size > AVATAR_MAX_BYTES) throw new AvatarError("Das Bild ist größer als 5 MB.");
  if (file.type && !AVATAR_TYPES.includes(file.type)) throw new AvatarError("Nur JPG, PNG, WebP oder GIF sind möglich.");
  const webp = await toWebp(Buffer.from(await file.arrayBuffer()));
  const hash = createHash("sha256").update(webp).digest("hex").slice(0, 12);
  const name = `avatars/${userId}-${hash}.webp`;

  if (usesBlob()) {
    const { put } = await import("@vercel/blob");
    const token = blobToken();
    // Public stores give a CDN URL; private stores (the default for new stores) are served through /api/avatar/<file>.
    try {
      const blob = await put(name, webp, { access: "public", contentType: "image/webp", addRandomSuffix: false, token });
      return blob.url;
    } catch {
      await put(name, webp, { access: "private", contentType: "image/webp", addRandomSuffix: false, token });
      return `/api/avatar/${path.basename(name)}`;
    }
  }

  if (process.env.VERCEL) {
    throw new AvatarError(
      "Der Bildspeicher ist nicht verbunden. In Vercel unter Storage einen Blob-Store mit dem Projekt verbinden und danach neu deployen.",
    );
  }

  const dir = path.join(process.cwd(), "public", "uploads", "avatars");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, path.basename(name)), webp);
  return `/uploads/${name}`;
}

/** Best-effort removal of a previously stored avatar (ignores external URLs). */
export async function deleteAvatar(url: string | null | undefined): Promise<void> {
  if (!url) return;
  try {
    if (url.startsWith("/uploads/")) {
      await unlink(path.join(process.cwd(), "public", url.replace(/^\//, "")));
    } else if (usesBlob() && url.startsWith("/api/avatar/")) {
      const { del } = await import("@vercel/blob");
      await del(`avatars/${path.basename(url)}`, { token: blobToken() });
    } else if (usesBlob() && /\.blob\.vercel-storage\.com\//.test(url)) {
      const { del } = await import("@vercel/blob");
      await del(url, { token: blobToken() });
    }
  } catch {
    // ignore – the file may already be gone
  }
}
