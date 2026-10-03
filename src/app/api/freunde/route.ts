import { getCurrentUser } from "@/lib/auth/dal";
import { listFriends } from "@/lib/friends/queries";

/** Friends of the signed-in user (for pickers such as "Vers an Freund senden"). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Nicht angemeldet." }, { status: 401 });
  const friends = await listFriends(user.id);
  return Response.json({ friends }, { headers: { "Cache-Control": "private, no-store" } });
}
